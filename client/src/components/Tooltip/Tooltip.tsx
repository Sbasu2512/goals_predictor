import React, { useEffect, useState } from "react";
import "./Tooltip.css";

interface TooltipProps {
  targetRef: React.RefObject<HTMLElement | HTMLLabelElement | null>;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ targetRef, text }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const showTooltip = () => {
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top - 35, // above the element
        left: rect.left + rect.width / 2,
      });
      setVisible(true);
    };

    const hideTooltip = () => setVisible(false);

    el.addEventListener("mouseenter", showTooltip);
    el.addEventListener("mouseleave", hideTooltip);

    return () => {
      el.removeEventListener("mouseenter", showTooltip);
      el.removeEventListener("mouseleave", hideTooltip);
    };
  }, [targetRef]);

  return (
    <>
      {visible && (
        <div
          className="custom-tooltip"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {text}
        </div>
      )}
    </>
  );
};

export default Tooltip;
