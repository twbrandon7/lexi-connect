'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button";
import { SlidersHorizontal, Lock, Unlock } from "lucide-react";
import type { Session } from "@/lib/types";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


type SessionManagementProps = {
    session: Session;
}

export function SessionManagement({ session }: SessionManagementProps) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleStateChange = (newState: 'closed' | 'reopened') => {
        if (!firestore) return;
        const sessionRef = doc(firestore, 'sessions', session.id);
        updateDocumentNonBlocking(sessionRef, { state: newState });
        toast({ title: 'Session Updated', description: `The session has been ${newState}.`});
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <SlidersHorizontal className="mr-2" />
                    Manage
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Session Controls</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {session.state !== 'closed' ? (
                    <DropdownMenuItem onClick={() => handleStateChange('closed')}>
                        <Lock className="mr-2" />
                        Close Session
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => handleStateChange('reopened')}>
                        <Unlock className="mr-2" />
                        Reopen Session
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
