import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import type React from 'react';

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger {...props} />;
}

function AlertDialogContent({ ...props }: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className="dialog-backdrop" />
      <AlertDialogPrimitive.Popup className="dialog" {...props} />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ ...props }: React.ComponentProps<'div'>) {
  return <div className="flex flex-col gap-(--space-2)" {...props} />;
}

function AlertDialogFooter({ ...props }: React.ComponentProps<'div'>) {
  return <div className="dialog-actions" {...props} />;
}

function AlertDialogTitle({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title className="dialog-title" {...props} />;
}

function AlertDialogDescription({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description className="dialog-body" {...props} />
  );
}

function AlertDialogAction({ ...props }: React.ComponentProps<'button'>) {
  return <button type="button" className="btn btn-primary" {...props} />;
}

function AlertDialogCancel({ ...props }: AlertDialogPrimitive.Close.Props) {
  return (
    <AlertDialogPrimitive.Close className="btn btn-secondary" {...props} />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
