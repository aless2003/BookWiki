import { useEffect, useState, useRef, forwardRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import { Mention, MentionBlot } from 'quill-mention';

const QuillInstance = ReactQuill.Quill;

QuillInstance.register({
  'modules/mention': Mention,
  'formats/mention': MentionBlot
}, true);

import 'react-quill-new/dist/quill.bubble.css';
import 'quill-mention/dist/quill.mention.css';

interface Entity {
  id: number;
  name: string;
}

interface RichTextEditorProps {
  content: string;
  characters?: Entity[];
  items?: Entity[];
  locations?: Entity[];
  lore?: Entity[];
  onChange: (html: string) => void;
  onSave?: () => void;
  onMentionClick?: (id: number, type: string) => void;
  minHeight?: string | number;
}

const RichTextEditor = forwardRef<any, RichTextEditorProps>(({ 
    content, 
    characters = [], 
    items = [], 
    locations = [], 
    lore = [], 
    onChange, 
    onSave, 
    onMentionClick,
    minHeight 
}, _ref) => {
  const quillRef = useRef<ReactQuill>(null);
  const onSaveRef = useRef(onSave);
  const onChangeRef = useRef(onChange);
  const onMentionClickRef = useRef(onMentionClick);
  const lastSentContent = useRef(content);

  const allEntities = useMemo(() => [
    ...characters.map(e => ({ ...e, type: 'character', icon: '👤' })),
    ...items.map(e => ({ ...e, type: 'item', icon: '📦' })),
    ...locations.map(e => ({ ...e, type: 'location', icon: '📍' })),
    ...lore.map(e => ({ ...e, type: 'lore', icon: '📜' }))
  ], [characters, items, locations, lore]);

  const dataRef = useRef(allEntities);
  useEffect(() => { dataRef.current = allEntities; }, [allEntities]);

  const toBubbles = (text: string) => {
    if (!text) return '';
    // Convert #{type:id} -> HTML Bubble
    return text.replace(/#\{(\w+):(\d+)\}/g, (_match, type, id) => {
        const entity = allEntities.find(e => e.type === type.toLowerCase() && e.id === parseInt(id));
        const name = entity ? entity.name : `Unknown ${type}`;
        return `<span class="mention" data-index="0" data-denotation-char="#" data-id="${id}" data-type="${type.toLowerCase()}" data-value="${name}">#${name}</span>`;
    });
  };

  const toShortcodes = (html: string) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all potential mentions (either by class or by our data attributes)
    const mentions = doc.querySelectorAll('.mention, [data-id][data-type]');
    
    mentions.forEach(el => {
        const type = el.getAttribute('data-type');
        const id = el.getAttribute('data-id');
        if (type && id) {
            const shortcode = `#{${type.toLowerCase()}:${id}}`;
            // Replace the entire element with the shortcode string
            el.outerHTML = shortcode;
        }
    });

    let result = doc.body.innerHTML;
    // Strip ZWNBSP (\uFEFF)
    result = result.replace(/\uFEFF/g, '');
    // Normalize &nbsp; and Unicode non-breaking spaces to regular spaces
    result = result.replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
    return result;
  };

  const [value, setValue] = useState(() => toBubbles(content));

  useEffect(() => {
    onSaveRef.current = onSave;
    onChangeRef.current = onChange;
    onMentionClickRef.current = onMentionClick;
  }, [onSave, onChange, onMentionClick]);

  useEffect(() => {
    if (content !== lastSentContent.current) {
        const nextValue = toBubbles(content);
        if (nextValue !== value) {
            setValue(nextValue);
            lastSentContent.current = content;
        }
    }
  }, [content, allEntities]); 

  const handleChange = (html: string) => {
    setValue(html);
    const shortcodeVersion = toShortcodes(html);
    if (shortcodeVersion !== lastSentContent.current) {
        console.log("Saving as shortcode:", shortcodeVersion); // Debug log
        lastSentContent.current = shortcodeVersion;
        onChangeRef.current(shortcodeVersion);
    }
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const handleContainerClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const mentionEl = target.closest('.mention');
        if (mentionEl && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            const id = mentionEl.getAttribute('data-id');
            const type = mentionEl.getAttribute('data-type');
            if (id && type && onMentionClickRef.current) {
                onMentionClickRef.current(parseInt(id), type);
            }
        }
    };

    quill.root.addEventListener('click', handleContainerClick);
    return () => quill.root.removeEventListener('click', handleContainerClick);
  }, []);

  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ],
    mention: {
      allowedChars: /^[A-Za-z\sÅÅÄÄÖÖ]*$/,
      mentionDenotationChars: ["#"],
      source: function(searchTerm: string, renderList: any) {
        const values = dataRef.current.map(e => ({ 
            id: e.id, 
            value: e.name, 
            type: e.type,
            icon: e.icon 
        }));

        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = values.filter(item => 
            item.value.toLowerCase().includes(searchTerm.toLowerCase())
          );
          renderList(matches, searchTerm);
        }
      },
      renderItem: (item: any) => {
          return `${item.icon} ${item.value} (${item.type})`;
      },
      onSelect: (item: any, insertItem: any) => {
          // Explicitly ensure type is passed to the insert function
          insertItem(item);
      },
      positioningStrategy: 'fixed',
      dataAttributes: ['id', 'value', 'denotationChar', 'type'], 
    },
    keyboard: {
      bindings: {
        save: {
          key: 'S',
          shortKey: true,
          handler: function() {
            if (onSaveRef.current) {
              onSaveRef.current();
            }
            return false;
          }
        }
      }
    }
  }), []);

  return (
    <div className="quill-bubble-wrapper" style={{ minHeight: minHeight }}>
      <ReactQuill 
        ref={quillRef}
        theme="bubble" 
        value={value} 
        onChange={handleChange}
        modules={modules}
        placeholder="Type # to link characters, items, locations, or lore..."
      />
      <style>{`
        .quill-bubble-wrapper {
          width: 100%;
          background: transparent;
        }
        .ql-container.ql-bubble {
          font-family: 'Inter', sans-serif;
          font-size: 1.2rem;
          color: #eee;
          line-height: 1.6;
        }
        .ql-editor {
          min-height: 500px;
          padding: 0;
          overflow-y: visible;
        }
        
        .mention {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            background-color: #0d6efd !important;
            color: white !important;
            padding: 0 12px !important;
            height: 1.6em !important;
            margin: 0 2px !important;
            border-radius: 1em !important;
            user-select: all !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            border: 1px solid #0a58ca !important;
            transition: background-color 0.2s !important;
            text-decoration: none !important;
            white-space: nowrap !important;
            vertical-align: middle !important;
            width: auto !important;
            line-height: 1 !important;
        }
        .mention:hover {
            background-color: #0b5ed7 !important;
            box-shadow: 0 0 8px rgba(13, 110, 253, 0.5) !important;
        }

        .ql-mention-list-container {
            background-color: #252525 !important;
            border: 1px solid #444 !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
            color: #eee !important;
            z-index: 9999 !important;
            min-width: 250px;
        }
        .ql-mention-list-item {
            padding: 10px 15px !important;
            color: #eee !important;
            cursor: pointer;
            border-bottom: 1px solid #333;
        }
        .ql-mention-list-item:last-child {
            border-bottom: none;
        }
        .ql-mention-list-item.selected {
            background-color: #0d6efd !important;
            color: white !important;
        }

        .ql-bubble .ql-tooltip {
          background-color: #252525 !important;
          color: #eee !important;
          border-radius: 8px !important;
          border: 1px solid #444 !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
          z-index: 1000;
        }
        .ql-bubble .ql-stroke {
          stroke: #ccc !important;
        }
        .ql-bubble .ql-fill {
          fill: #ccc !important;
        }
        .ql-editor.ql-blank::before {
          color: #555 !important;
          font-style: italic !important;
          left: 0 !important;
        }
      `}</style>
    </div>
  );
});

export default RichTextEditor;