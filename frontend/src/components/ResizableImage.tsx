import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EDITOR_MAX_WIDTH, EDITOR_MAX_HEIGHT } from '../constants/editor';

interface ResizableImageProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width: string;
      height: string;
    };
  };
  updateAttributes: (attrs: Record<string, any>) => void;
  selected: boolean;
  editor: any;
  getPos: () => number;
}

const ResizableImageComponent = ({ node, updateAttributes, selected, editor, getPos }: ResizableImageProps) => {
  const { src, alt, title, width, height } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  // Local state for the size during the drag to avoid document-wide layout shifts
  const [displayedSize, setDisplayedSize] = useState({ width: width || 'auto', height: height || 'auto' });        

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setAspectRatio(img.width / img.height);
    };
  }, [src]);

  // Sync displayedSize with node attributes when not resizing
  useEffect(() => {
    if (!resizing) {
      setDisplayedSize({ width: width || 'auto', height: height || 'auto' });
    }
  }, [width, height, resizing]);

  const onMouseDown = (event: React.MouseEvent, handle: string) => {
    event.preventDefault();
    event.stopPropagation();

    const container = containerRef.current;
    const imageWrapper = container?.querySelector('.image-wrapper');
    const containerRect = container?.getBoundingClientRect();
    const imageRect = imageWrapper?.getBoundingClientRect();

    if (containerRect && imageRect) {
      // Lock the container height to prevent pagination jumps
      setLockedHeight(containerRect.height);
      setInitialSize({ width: imageRect.width, height: imageRect.height });
      setInitialPos({ x: event.clientX, y: event.clientY });
      setResizing(true);
      setCurrentHandle(handle);
    }
  };

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (!resizing || !currentHandle) return;

    const dx = event.clientX - initialPos.x;
    const dy = event.clientY - initialPos.y;

    // Correct 1:1 feel:
    // Width is 2:1 because it's centered.
    let newWidth = initialSize.width + (currentHandle.includes('left') ? -dx * 2 : (currentHandle.includes('right') ? dx * 2 : 0));
    let newHeight = initialSize.height + (currentHandle.includes('top') ? -dy : (currentHandle.includes('bottom') ? dy : 0));

    const isShiftPressed = event.shiftKey;
    const isCorner = currentHandle.includes('-');
    let lockAspectRatio = isCorner ? !isShiftPressed : isShiftPressed;

    if (lockAspectRatio) {
      const ratioX = newWidth / initialSize.width;
      const ratioY = newHeight / initialSize.height;

      if (Math.abs(ratioX - 1) > Math.abs(ratioY - 1)) {
        newHeight = newWidth / aspectRatio;
      } else {
        newWidth = newHeight * aspectRatio;
      }

      if (newWidth > EDITOR_MAX_WIDTH) {
        newWidth = EDITOR_MAX_WIDTH;
        newHeight = newWidth / aspectRatio;
      }
      if (newHeight > EDITOR_MAX_HEIGHT) {
        newHeight = EDITOR_MAX_HEIGHT;
        newWidth = newHeight * aspectRatio;
      }
    } else {
      newWidth = Math.min(newWidth, EDITOR_MAX_WIDTH);
      newHeight = Math.min(newHeight, EDITOR_MAX_HEIGHT);
    }

    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);

    setDisplayedSize({
      width: `${newWidth}px`,
      height: `${newHeight}px`,
    });
  }, [resizing, currentHandle, initialPos, initialSize, aspectRatio]);

  const onMouseUp = useCallback(() => {
    if (resizing) {
      updateAttributes({
        width: displayedSize.width,
        height: displayedSize.height,
      });
    }
    setResizing(false);
    setLockedHeight(null);
    setCurrentHandle(null);
  }, [resizing, displayedSize, updateAttributes]);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, onMouseMove, onMouseUp]);

  const onDoubleClick = () => {
    const isFullWidth = width === '100%' || width === `${EDITOR_MAX_WIDTH}px`;
    updateAttributes({
      width: isFullWidth ? 'auto' : '100%',
      height: 'auto',
    });
  };
  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof getPos === 'function') {
      editor.commands.setNodeSelection(getPos());
    }
  };

  return (
    <NodeViewWrapper 
      className={`resizable-image-container ${selected ? 'is-selected' : ''}`} 
      ref={containerRef}
      contentEditable={false}
      draggable="false"
      onClick={handleSelect}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        margin: '1.5rem 0',
        height: lockedHeight ? `${lockedHeight}px` : 'auto',
        minHeight: lockedHeight ? `${lockedHeight}px` : 'auto',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="image-wrapper"
        onDoubleClick={onDoubleClick}
        style={{ 
          width: displayedSize.width, 
          height: displayedSize.height,
          position: resizing ? 'absolute' : 'relative',
          top: resizing ? 0 : 'auto',
          left: resizing ? '50%' : 'auto',
          transform: resizing ? 'translateX(-50%)' : 'none',
          display: 'inline-block',
          lineHeight: 0,
          borderRadius: '8px',
          boxSizing: 'border-box',
          transition: resizing ? 'none' : 'box-shadow 0.2s ease-in-out',
          zIndex: resizing ? 1000 : 1,
          backgroundColor: resizing ? 'rgba(30, 30, 30, 0.4)' : 'transparent',
          boxShadow: resizing ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
        }}
      >
        <img 
          src={src} 
          alt={alt} 
          title={title} 
          style={{ 
            width: '100%', 
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
            borderRadius: '8px',
            opacity: resizing ? 0.9 : 1
          }} 
        />
        
        {selected && (
          <div className="selection-overlay" style={{ 
            position: 'absolute', 
            top: -2, 
            left: -2, 
            right: -2, 
            bottom: -2, 
            border: '2px solid #90caf9', 
            borderRadius: '10px', 
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div className="resize-handle top-left" onMouseDown={(e) => onMouseDown(e, 'top-left')} style={{ pointerEvents: 'auto' }} />
            <div className="resize-handle top-right" onMouseDown={(e) => onMouseDown(e, 'top-right')} style={{ pointerEvents: 'auto' }} />
            <div className="resize-handle bottom-left" onMouseDown={(e) => onMouseDown(e, 'bottom-left')} style={{ pointerEvents: 'auto' }} />
            <div className="resize-handle bottom-right" onMouseDown={(e) => onMouseDown(e, 'bottom-right')} style={{ pointerEvents: 'auto' }} />
            <div className="resize-handle right" onMouseDown={(e) => onMouseDown(e, 'right')} style={{ pointerEvents: 'auto' }} />
            <div className="resize-handle bottom" onMouseDown={(e) => onMouseDown(e, 'bottom')} style={{ pointerEvents: 'auto' }} />
          </div>
        )}
      </div>

      <style>{`
        .resizable-image-container {
          cursor: pointer;
        }

        .resize-handle {
          position: absolute;
          background-color: #90caf9;
          border: 2px solid #fff;
          z-index: 100;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
          transition: transform 0.1s ease, background-color 0.1s ease;
        }
        
        .resize-handle:hover {
          transform: scale(1.2);
          background-color: #42a5f5;
        }

        /* Corner handles - Circular */
        .top-left, .top-right, .bottom-left, .bottom-right {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .top-left { top: -6px; left: -6px; cursor: nwse-resize; }
        .top-right { top: -6px; right: -6px; cursor: nesw-resize; }
        .bottom-left { bottom: -6px; left: -6px; cursor: nesw-resize; }
        .bottom-right { bottom: -6px; right: -6px; cursor: nwse-resize; }

        /* Edge handles - Pill shape */
        .right { 
          top: 50%; 
          right: -6px; 
          transform: translateY(-50%); 
          height: 24px; 
          width: 8px; 
          border-radius: 4px; 
          cursor: ew-resize; 
        }
        .right:hover {
          transform: translateY(-50%) scale(1.1);
        }
        
        .bottom { 
          bottom: -6px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 24px; 
          height: 8px; 
          border-radius: 4px; 
          cursor: ns-resize; 
        }
        .bottom:hover {
          transform: translateX(-50%) scale(1.1);
        }
      `}</style>
    </NodeViewWrapper>
  );
};

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  content: 'inline*',
  inline: false,
  draggable: false,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { 
        default: 'auto',
        parseHTML: element => element.style.width || element.getAttribute('width'),
        renderHTML: attributes => ({
          style: `width: ${attributes.width}; height: ${attributes.height || 'auto'}`,
        }),
      },
      height: { 
        default: 'auto',
        parseHTML: element => element.style.height || element.getAttribute('height'),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});
