import * as Dialog from "@radix-ui/react-dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Xác nhận xóa",
  description = "Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.",
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-6 shadow-xl">
          <Dialog.Title className="text-lg font-bold text-white mb-2">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-400 mb-6">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-6 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg transition-all"
            >
              Xóa
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
