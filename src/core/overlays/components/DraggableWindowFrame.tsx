import { useRef, useCallback, type ReactNode, type PointerEvent } from "react";

interface Props {
  title: string;
  width: number;
  height: number;
  x: number;
  y: number;
  zIndex: number;
  onClose: () => void;
  onPointerDown: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
}

/**
 * A simple draggable window chrome used by ModelessHost.
 * Drag is handled via pointer events on the header bar.
 */
export function DraggableWindowFrame({
  title,
  width,
  height,
  x,
  y,
  zIndex,
  onClose,
  onPointerDown,
  onMove,
  children,
}: Props) {
  const dragOffset = useRef({ dx: 0, dy: 0 });

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragOffset.current = { dx: e.clientX - x, dy: e.clientY - y };
      onPointerDown();
    },
    [x, y, onPointerDown],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
      onMove(
        e.clientX - dragOffset.current.dx,
        e.clientY - dragOffset.current.dy,
      );
    },
    [onMove],
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [],
  );

  return (
    <div
      role="dialog"
      aria-label={title}
      className="absolute rounded-lg border border-gray-300 bg-white shadow-lg focus-within:ring-2 focus-within:ring-blue-300"
      style={{ left: x, top: y, width, zIndex }}
      onPointerDown={onPointerDown}
    >
      {/* Title bar — draggable */}
      <div
        className="flex cursor-grab items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-3 py-1.5 select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span className="text-xs font-semibold text-gray-600">{title}</span>
        <button
          aria-label="Close window"
          className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          &times;
        </button>
      </div>
      {/* Content */}
      <div className="p-3" style={{ minHeight: height - 40 }}>
        {children}
      </div>
    </div>
  );
}
