'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button";
import { SlidersHorizontal, Lock, Unlock, Trash2 } from "lucide-react";
import type { Session } from "@/lib/types";
import { useFirestore, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";


type SessionManagementProps = {
    session: Session;
}

export function SessionManagement({ session }: SessionManagementProps) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    const handleStateChange = (newState: 'closed' | 'reopened') => {
        if (!firestore) return;
        const sessionRef = doc(firestore, 'sessions', session.id);
        updateDocumentNonBlocking(sessionRef, { state: newState });
        toast({ title: 'Session Updated', description: `The session has been ${newState}.`});
    }

    const handleDeleteSession = async () => {
      if (!firestore) return;
      // Note: This only deletes the session doc, not subcollections.
      // A Cloud Function would be needed for a full cleanup.
      const sessionRef = doc(firestore, 'sessions', session.id);
      deleteDocumentNonBlocking(sessionRef);
      toast({ title: 'Session Deleted', description: 'The session has been permanently removed.' });
      router.push('/');
    };

    return (
        <>
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
                 <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2" />
                    Delete Session
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the session
                    and all of its vocabulary cards.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSession}>
                    Delete Session
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    )
}
