import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';


// React component for the inline image node
const InlineImageComponent = ({ node }: ReactNodeViewProps) => {
  const { src, emoteName } = node.attrs;

  return (
    <NodeViewWrapper
      className="inline-image-emote"
      as="span" // Render as span to keep it inline
      data-emotename={emoteName} // Add emoteName as data attribute
    >
      <img
        src={src}
        alt={emoteName || 'inline image'}
        title={emoteName || 'inline image'}
        // Styling for square aspect ratio and relative size
        style={{
          display: 'inline-block',
          height: '1.5em', // Relative to font size
          width: '1.5em',  // Relative to font size
          objectFit: 'cover', // Ensures the image covers the square area
          verticalAlign: 'middle', // Align with text
        }}
      />
    </NodeViewWrapper>
  );
};

// Tiptap extension for the inline image node
export const InlineImage = Node.create({
  name: 'inlineImage',
  group: 'inline', // Make it an inline node
  inline: true,    // Make it an inline node
  atom: true,      // Treat as a single unit

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      emoteName: { // Optional emoteName attribute
        default: null,
        parseHTML: element => element.getAttribute('data-emotename'),
        renderHTML: attributes => {
          if (!attributes.emoteName) {
            return {}
          }
          return {
            'data-emotename': attributes.emoteName,
          }
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img.inline-image-emote', // Match our rendered tag with class
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { class: 'inline-image-emote' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageComponent);
  },
});
