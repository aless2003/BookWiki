import {useEffect, useState, useRef, forwardRef, useMemo} from 'react';
import ReactQuill from 'react-quill-new';
import {Mention, MentionBlot} from 'quill-mention';

const QuillInstance = ReactQuill.Quill;
const Parchment = QuillInstance.import('parchment');

const WidthStyle = new Parchment.StyleAttributor('width', 'width', {
  scope: Parchment.Scope.BLOCK
});

QuillInstance.register({
  'modules/mention': Mention,
  'formats/mention': MentionBlot
}, true);
QuillInstance.register(WidthStyle, true);
import 'react-quill-new/dist/quill.bubble.css';
import 'quill-mention/dist/quill.mention.css';
import {API_BASE_URL} from '../constants/media';

interface Entity {
    id?: number;
    name: string;
}

interface RichTextEditorProps {
    content: string;
    placeholder?: string;
    characters?: Entity[];
    items?: Entity[];
    locations?: Entity[];
    lore?: Entity[];
    species?: Entity[];
    onChange: (html: string) => void;
    onSave?: () => void;
    onMentionClick?: (id: number, type: string, isMiddleClick?: boolean) => void;
    minHeight?: string | number;
}

const RichTextEditor = forwardRef<any, RichTextEditorProps>(({
                                                                 content,
                                                                 placeholder = "Type # to link characters, items, locations, or lore...",
                                                                 characters = [],
                                                                 items = [],
                                                                 locations = [],
                                                                 lore = [],
                                                                 species = [],
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

    const allEntities = useMemo(() => {
        const filter = (e: Entity) => e.id !== undefined;
        return [
            ...characters.filter(filter).map(e => ({...e, type: 'character', icon: '👤'})),
            ...items.filter(filter).map(e => ({...e, type: 'item', icon: '📦'})),
            ...locations.filter(filter).map(e => ({...e, type: 'location', icon: '📍'})),
            ...lore.filter(filter).map(e => ({...e, type: 'lore', icon: '📜'})),
            ...species.filter(filter).map(e => ({...e, type: 'species', icon: '🐾'}))
        ];
    }, [characters, items, locations, lore, species]);

    const dataRef = useRef(allEntities);
    useEffect(() => {
        dataRef.current = allEntities;
    }, [allEntities]);

    const toBubbles = (text: string) => {
        if (!text) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // 1. Resolve images in src attributes
        const images = doc.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src?.startsWith('#{image:') || src?.startsWith('#{emote:')) {
                const uuid = src.substring(src.indexOf(':') + 1, src.indexOf('}'));
                img.setAttribute('src', `${API_BASE_URL}/api/media/${uuid}`);
                img.setAttribute('data-id', uuid);
                img.setAttribute('data-type', src.startsWith('#{image:') ? 'image' : 'emote');
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });

        // 2. Resolve mentions in the resulting HTML string
        let processed = doc.body.innerHTML;
        processed = processed.replace(/#\{(\w+):(\d+)\}/g, (_match, type, id) => {
            const entity = allEntities.find(e => e.type === type.toLowerCase() && e.id === parseInt(id));
            const name = entity ? entity.name : `Unknown ${type}`;
            return `<span class="mention" data-index="0" data-denotation-char="#" data-id="${id}" data-type="${type.toLowerCase()}" data-value="${name}">${name}</span>`;
        });

        // 3. Fallback for raw image shortcodes
        processed = processed.replace(/#\{image:([\w\-]+)\}/g, (_match, id) => {
            return `<img src="${API_BASE_URL}/api/media/${id}" data-id="${id}" data-type="image" style="max-width: 100%; height: auto;" />`;
        });
        processed = processed.replace(/#\{emote:([\w\-]+)\}/g, (_match, id) => {
            return `<img src="${API_BASE_URL}/api/media/${id}" data-id="${id}" data-type="emote" style="max-width: 100%; height: auto;" />`;
        });

        return processed;
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
                if (el.tagName === 'IMG') {
                    el.setAttribute('src', `#{${type.toLowerCase()}:${id}}`);
                } else {
                    const shortcode = `#{${type.toLowerCase()}:${id}}`;
                    // Replace the entire element with the shortcode string
                    el.outerHTML = shortcode;
                }
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
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [tableRows, setTableRows] = useState(3);
    const [tableCols, setTableCols] = useState(3);
    const [tableContextMenu, setTableContextMenu] = useState<{ show: boolean, x: number, y: number }>({
        show: false,
        x: 0,
        y: 0
    });

    useEffect(() => {
        const handleGlobalClick = () => {
            setTableContextMenu(prev => prev.show ? {...prev, show: false} : prev);
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

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

    const handleChange = (html: string, _delta: any, source: string) => {
        setValue(html);
        if (source !== 'user') return; // Only trigger if the user actually typed something

        const shortcodeVersion = toShortcodes(html);
        if (shortcodeVersion !== lastSentContent.current) {
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
            if (mentionEl) {
                const isMiddleClick = e.button === 1;
                if (e.ctrlKey || e.metaKey || isMiddleClick) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = mentionEl.getAttribute('data-id');
                    const type = mentionEl.getAttribute('data-type');
                    if (id && type && onMentionClickRef.current) {
                        onMentionClickRef.current(parseInt(id), type, isMiddleClick);
                    }
                }
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cell = target.closest('td, th');
            if (cell) {
                e.preventDefault();
                // Try to make sure selection is inside the table cell if Quill is not focused.
                const quillNode = QuillInstance.find(cell);
                if (quillNode) {
                    if (!(quillNode instanceof QuillInstance)) {
                        const offset = quillNode.offset(quill.scroll);
                        if (offset !== undefined) {
                            quill.setSelection(offset, 0);
                        }
                    }
                }
                setTableContextMenu({ show: true, x: e.clientX, y: e.clientY });
            }
        };

        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        let resizeCell: HTMLElement | null = null;
        let resizeTable: HTMLTableElement | null = null;
        let resizeCellIndex = -1;
        let dragLine: HTMLDivElement | null = null;

        const onGlobalMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizeCell || !resizeTable) return;
            e.preventDefault();
            const diff = e.clientX - startX;
            const newWidth = Math.max(30, startWidth + diff);
            
            if (!dragLine) {
                dragLine = document.createElement('div');
                dragLine.style.position = 'fixed';
                dragLine.style.top = resizeTable.getBoundingClientRect().top + 'px';
                dragLine.style.height = resizeTable.getBoundingClientRect().height + 'px';
                dragLine.style.width = '2px';
                dragLine.style.backgroundColor = '#90caf9';
                dragLine.style.zIndex = '10000';
                dragLine.style.pointerEvents = 'none';
                document.body.appendChild(dragLine);
            }
            
            const cellRect = resizeCell.getBoundingClientRect();
            dragLine.style.left = (cellRect.left + newWidth) + 'px';
        };

        const onGlobalMouseUp = (e: MouseEvent) => {
            if (isResizing) {
                isResizing = false;
                
                if (dragLine) {
                    dragLine.remove();
                    dragLine = null;
                }
                
                if (resizeTable && resizeCell) {
                    const diff = e.clientX - startX;
                    const newWidth = Math.max(30, startWidth + diff);
                    const rows = Array.from(resizeTable.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const cell = row.children[resizeCellIndex] as HTMLElement;
                        if (cell) {
                            cell.style.width = newWidth + 'px';
                        }
                    });
                    
                    if (quill) {
                        quill.update('user');
                    }
                }
                
                resizeCell = null;
                resizeTable = null;
                document.body.style.cursor = 'default';
                document.body.style.userSelect = '';
            }
        };

        const onEditorMouseMove = (e: MouseEvent) => {
            if (isResizing) return;
            const target = e.target as HTMLElement;
            const cell = target.closest('td, th') as HTMLElement;
            if (cell) {
                const rect = cell.getBoundingClientRect();
                // If near right border
                if (e.clientX > rect.right - 8 && e.clientX <= rect.right) {
                    cell.style.cursor = 'col-resize';
                } else {
                    cell.style.cursor = 'text';
                }
            }
        };

        const onEditorMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cell = target.closest('td, th') as HTMLElement;
            if (cell && cell.style.cursor === 'col-resize') {
                isResizing = true;
                startX = e.clientX;
                startWidth = cell.getBoundingClientRect().width;
                resizeCell = cell;
                resizeTable = cell.closest('table');
                resizeCellIndex = Array.from(cell.parentElement!.children).indexOf(cell);
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const onDragStart = (e: DragEvent) => {
            if (isResizing) {
                e.preventDefault();
            }
        };

        quill.root.addEventListener('click', handleContainerClick);
        quill.root.addEventListener('contextmenu', handleContextMenu);
        quill.root.addEventListener('mousemove', onEditorMouseMove);
        quill.root.addEventListener('mousedown', onEditorMouseDown, { capture: true });
        document.addEventListener('mousemove', onGlobalMouseMove, { capture: true });
        document.addEventListener('mouseup', onGlobalMouseUp, { capture: true });
        document.addEventListener('dragstart', onDragStart, { capture: true });

        return () => {
            quill.root.removeEventListener('click', handleContainerClick);
            quill.root.removeEventListener('contextmenu', handleContextMenu);
            quill.root.removeEventListener('mousemove', onEditorMouseMove);
            quill.root.removeEventListener('mousedown', onEditorMouseDown, { capture: true });
            document.removeEventListener('mousemove', onGlobalMouseMove, { capture: true });
            document.removeEventListener('mouseup', onGlobalMouseUp, { capture: true });
            document.removeEventListener('dragstart', onDragStart, { capture: true });
        };
        }, []);

    const handleTableCommand = (command: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const tableModule: any = quill.getModule('table');
        if (!tableModule) return;

        switch (command) {
            case 'insertRowAbove':
                tableModule.insertRowAbove();
                break;
            case 'insertRowBelow':
                tableModule.insertRowBelow();
                break;
            case 'insertColumnLeft':
                tableModule.insertColumnLeft();
                break;
            case 'insertColumnRight':
                tableModule.insertColumnRight();
                break;
            case 'deleteRow':
                tableModule.deleteRow();
                break;
            case 'deleteColumn':
                tableModule.deleteColumn();
                break;
            case 'deleteTable':
                tableModule.deleteTable();
                break;
        }
        setTableContextMenu(prev => ({...prev, show: false}));
    };

    const modules = useMemo(() => ({
        table: true,
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{'header': 1}, {'header': 2}],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['clean']
        ],
        mention: {
            allowedChars: /^[A-Za-z\sÅÅÄÄÖÖ]*$/,
            mentionDenotationChars: ["#"],
            showDenotationChar: false,
            source: function (searchTerm: string, renderList: any) {
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
                    handler: function () {
                        if (onSaveRef.current) {
                            onSaveRef.current();
                        }
                        return false;
                    }
                }
            }
        }
    }), []);

    const handleFormat = (e: React.MouseEvent, format: string, value: any = true) => {
        e.preventDefault();
        const quill = quillRef.current?.getEditor();
        if (quill) quill.format(format, value);
    };

    const handleHeader = (e: React.MouseEvent, level: number) => {
        e.preventDefault();
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const currentFormat = quill.getFormat();
            quill.format('header', currentFormat.header === level ? false : level);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const selection = quill.getSelection(true);
            if (selection) {
                quill.removeFormat(selection.index, selection.length);
            }
        }
    };

    const handleInsertTable = (e: React.MouseEvent) => {
        e.preventDefault();
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const tableModule: any = quill.getModule('table');
            if (tableModule) {
                if (tableRows > 0 && tableCols > 0) {
                    tableModule.insertTable(tableRows, tableCols);
                    setShowTableMenu(false);
                }
            } else {
                alert('Table module is not enabled or available.');
            }
        }
    };

    return (
        <div className="quill-bubble-wrapper" style={{minHeight: minHeight}}>
            <div className="custom-static-toolbar">
                <button type="button" onMouseDown={(e) => handleFormat(e, 'bold')} title="Bold"><b>B</b></button>
                <button type="button" onMouseDown={(e) => handleFormat(e, 'italic')} title="Italic"><i>I</i></button>
                <button type="button" onMouseDown={(e) => handleFormat(e, 'underline')} title="Underline"><u>U</u>
                </button>
                <button type="button" onMouseDown={(e) => handleFormat(e, 'strike')} title="Strikethrough"><s>S</s>
                </button>
                <div className="toolbar-separator"/>
                <button type="button" onMouseDown={(e) => handleHeader(e, 1)} title="Heading 1"><b>H1</b></button>
                <button type="button" onMouseDown={(e) => handleHeader(e, 2)} title="Heading 2"><b>H2</b></button>
                <div className="toolbar-separator"/>
                <button type="button" onMouseDown={(e) => handleFormat(e, 'list', 'ordered')} title="Ordered List">
                    <b>1.</b></button>
                <button type="button" onMouseDown={(e) => handleFormat(e, 'list', 'bullet')} title="Bullet List">
                    <b>•</b></button>
                <div className="toolbar-separator"/>
                <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center'}}>
                    <button type="button" onMouseDown={(e) => {
                        e.preventDefault();
                        setShowTableMenu(!showTableMenu);
                    }} title="Table Menu"><b>Table</b></button>
                    {showTableMenu && (
                        <div className="table-menu-popover">
                            <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                                <label>Rows: <input type="number" min="1" value={tableRows}
                                                    onChange={e => setTableRows(parseInt(e.target.value) || 1)} style={{
                                    width: '40px',
                                    background: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    padding: '2px'
                                }}/></label>
                                <label>Cols: <input type="number" min="1" value={tableCols}
                                                    onChange={e => setTableCols(parseInt(e.target.value) || 1)} style={{
                                    width: '40px',
                                    background: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '4px',
                                    padding: '2px'
                                }}/></label>
                            </div>
                            <button type="button" onMouseDown={handleInsertTable}
                                    style={{width: '100%', background: '#0d6efd', color: '#fff'}}>Insert Table
                            </button>
                        </div>
                    )}
                </div>
                <div className="toolbar-separator"/>
                <button type="button" onMouseDown={handleClear} title="Clear Formatting"><b>Tx</b></button>
            </div>
            <ReactQuill
                ref={quillRef}
                theme="bubble"
                value={value}
                onChange={handleChange}
                modules={modules}
                placeholder={placeholder}
            />
            {tableContextMenu.show && (
                <div
                    className="table-context-menu"
                    style={{top: tableContextMenu.y, left: tableContextMenu.x}}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button type="button" onClick={() => handleTableCommand('insertRowAbove')}>Insert Row Above</button>
                    <button type="button" onClick={() => handleTableCommand('insertRowBelow')}>Insert Row Below</button>
                    <button type="button" onClick={() => handleTableCommand('insertColumnLeft')}>Insert Column Left
                    </button>
                    <button type="button" onClick={() => handleTableCommand('insertColumnRight')}>Insert Column Right
                    </button>
                    <div className="menu-divider"/>
                    <button type="button" onClick={() => handleTableCommand('deleteRow')}
                            style={{color: '#ff6b6b'}}>Delete Row
                    </button>
                    <button type="button" onClick={() => handleTableCommand('deleteColumn')}
                            style={{color: '#ff6b6b'}}>Delete Column
                    </button>
                    <div className="menu-divider"/>
                    <button type="button" onClick={() => handleTableCommand('deleteTable')}
                            style={{color: '#ff6b6b'}}>Delete Table
                    </button>
                </div>
            )}
            <style>{`
        .table-context-menu {
          position: fixed;
          background-color: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 8px 0;
          box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          min-width: 180px;
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        }
        .table-context-menu button {
          background: transparent;
          border: none;
          color: #fff;
          padding: 10px 20px;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 400;
          transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        }
        .table-context-menu button:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #fff !important;
        }
        .table-context-menu .menu-divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.12);
          margin: 8px 0;
        }
        .custom-static-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px;
          background-color: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          align-items: center;
          margin-bottom: 16px;
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
          box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
        }
        .custom-static-toolbar button {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        }
        .custom-static-toolbar button:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .custom-static-toolbar .toolbar-separator {
          width: 1px;
          height: 24px;
          background-color: rgba(255, 255, 255, 0.12);
          margin: 0 8px;
        }

        .table-menu-popover {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background-color: #1e1e1e;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
          font-size: 0.875rem;
        }
        .table-menu-popover label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }
        .table-menu-popover input {
          background: #121212;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.23);
          border-radius: 4px;
          padding: 4px 8px;
          outline: none;
          transition: border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        }
        .table-menu-popover input:focus {
          border-color: #90caf9;
        }
        .table-menu-popover button[type="button"] {
          background-color: #90caf9;
          color: rgba(0, 0, 0, 0.87) !important;
          border: none;
          border-radius: 8px;
          padding: 6px 16px;
          margin-top: 12px;
          font-weight: 600;
          transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
          box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
        }
        .table-menu-popover button[type="button"]:hover {
          background-color: #64b5f6 !important;
          box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
        }
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
            color: #90caf9 !important;
            background-color: rgba(144, 202, 249, 0.1) !important;
            padding: 0 6px !important;
            margin: 0 2px !important;
            border-radius: 4px !important;
            border-bottom: 1px dashed rgba(144, 202, 249, 0.4) !important;
            user-select: all !important;
            font-weight: 500 !important;
            cursor: pointer !important;
            transition: all 0.2s ease !important;
            text-decoration: none !important;
            white-space: nowrap !important;
            vertical-align: middle !important;
            height: 1.5em !important;
            width: auto !important;
        }
        .ql-mention-denotation-char {
            display: none !important;
        }
        .mention:hover {
            background-color: rgba(144, 202, 249, 0.2) !important;
            color: #fff !important;
            border-bottom: 1px solid #90caf9 !important;
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
        .ql-stroke {
          stroke: #ccc !important;
        }
        .ql-fill {
          fill: #ccc !important;
        }
        .ql-editor.ql-blank::before {
          color: #555 !important;
          font-style: italic !important;
          left: 0 !important;
        }

        .ql-editor table {
          border-collapse: collapse;
          margin-bottom: 1em;
          table-layout: fixed;
        }
        .ql-editor table td, .ql-editor table th {
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 8px;
          min-width: 50px;
        }
      `}</style>
        </div>
    );
});

export default RichTextEditor;