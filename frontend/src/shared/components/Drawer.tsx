import type { ReactNode } from 'react';

type DrawerProps = {
  title: string;
  isOpen: boolean;
  onClose(): void;
  children: ReactNode;
};

const secondaryButtonClass =
  'cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 hover:bg-slate-50';

export function Drawer({ title, isOpen, onClose, children }: DrawerProps): JSX.Element | null {
  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className="fixed top-0 right-0 z-[1000] h-screen w-[min(420px,100vw)] overflow-auto border-l border-slate-200 bg-white shadow-2xl"
      aria-label={title}
    >
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
        <h2 className="m-0 text-xl font-bold">{title}</h2>
        <button type="button" className={secondaryButtonClass} onClick={onClose}>
          Close
        </button>
      </header>
      <div className="p-5">{children}</div>
    </aside>
  );
}
