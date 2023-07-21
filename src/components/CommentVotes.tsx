"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { FC, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { CommentVoteRequest } from "@/lib/validators/vote";

type PartialVote = Pick<CommentVote, "type">;

interface CommentVoteProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: PartialVote;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  initialVotesAmt,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setvotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setcurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setvotesAmt((prev) => prev - 1);
      else setvotesAmt((prev) => prev + 1);

      setcurrentVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "Something went wrong!",
        description: "Your vote was not registered, please try again later",
        variant: "destructive",
      });
    },
    onMutate: (type) => {
      if (currentVote?.type === type) {
        setcurrentVote(undefined);
        if (type === "UP") setvotesAmt((prev) => prev - 1);
        else if (type === "DOWN") setvotesAmt((prev) => prev + 1);
      } else {
        setcurrentVote({ type });
        if (type === "UP") setvotesAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setvotesAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className="flex gap-1">
      {/* upvote */}
      <Button
        onClick={() => {
          vote("UP");
        }}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        size="sm"
        className={cn({
          "text-emerald-500": currentVote?.type === "DOWN",
        })}
        variant="ghost"
        aria-label="downvote"
        onClick={() => {
          vote("DOWN");
        }}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVote;
