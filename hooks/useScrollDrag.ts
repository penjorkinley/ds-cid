import { useRef, useState, useEffect } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export const useScrollDrag = (
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging]);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearInterval(scrollTimerRef.current);
      }
    };
  }, []);

  const handleDragWithScroll = () => {
    if (!isDragging) return;

    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const scrollMargin = 30;
      const scrollSpeed = 8;

      // Vertical scrolling
      if (mousePosition.y > containerRect.bottom - scrollMargin) {
        container.scrollTop += scrollSpeed;
      }

      if (mousePosition.y < containerRect.top + scrollMargin) {
        container.scrollTop -= scrollSpeed;
      }

      // Horizontal scrolling
      if (mousePosition.x > containerRect.right - scrollMargin) {
        container.scrollLeft += scrollSpeed;
      }

      if (mousePosition.x < containerRect.left + scrollMargin) {
        container.scrollLeft -= scrollSpeed;
      }
    }
  };

  const startScrollTimer = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
    }

    scrollTimerRef.current = setInterval(() => {
      handleDragWithScroll();
    }, 50);

    return scrollTimerRef.current;
  };

  const startDragging = () => {
    setIsDragging(true);
    startScrollTimer();
  };

  const stopDragging = () => {
    setIsDragging(false);
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
    }
  };

  return { isDragging, startDragging, stopDragging };
};
