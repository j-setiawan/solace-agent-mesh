import { Badge } from "@/lib/components/ui";
import type { MessageFE, VisualizedTask } from "@/lib/types";
import { useMemo, type JSX } from "react";
import { LoadingMessageRow } from "../chat";
import { useChatContext } from "@/lib/hooks";

const getStatusBadge = (status: string, type: "info" | "error" | "success") => {
    return (
        <Badge type={type} className={`rounded-full border-none`}>
            <span className="text-xs font-semibold" title={status}>
                {status}
            </span>
        </Badge>
    );
};

const getTaskStatus = (task: VisualizedTask, loadingMessage: MessageFE | undefined): string | JSX.Element => {
	switch (task.status) {
		case "submitted":
		case "working":
			return <div title={loadingMessage?.text || task.status}><LoadingMessageRow statusText={loadingMessage?.text || task.status} /></div>;
		case "input-required":
			return getStatusBadge("Input Required", "info");
		case "completed":
			return getStatusBadge("Completed", "success");
		case "canceled":
			return getStatusBadge("Canceled", "info");
		case "failed":
			return getStatusBadge("Failed", "error");
		default:
			return getStatusBadge("Unknown", "info");
	}
};

export const FlowChartDetails: React.FC<{ task: VisualizedTask  }> = ({ task }) => {
	const { messages } = useChatContext();
	const loadingMessage = useMemo(() => {
		return messages.find(message => message.isStatusBubble);
	}, [messages]);
	
    if (!task) {
        return null;
    }

    return (
        <div className="p-4 border-b grid grid-cols-[auto_1fr] grid-rows-[32px_32px] gap-x-8 leading-[32px]">
			<div className="text-muted-foreground">User</div><div className="truncate" title={task.initialRequestText}>{task.initialRequestText}</div>
			<div className="text-muted-foreground">Status</div><div className="truncate">{getTaskStatus(task, loadingMessage)}</div>
        </div>
    );
};
