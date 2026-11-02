import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export default function Dropdown({
  value,
  onChange,
  options = [],
  label,
  icon = null,
  placeholder = 'Seleccionar',
  className = '',
  panelClassName = '',
  buttonClassName = '',
  align = 'left',
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const listRef = useRef(null)
  const listId = useId()

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const openMenu = () => {
    if (!options.length) return
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
    setOpen(true)
  }

  const closeMenu = (focusButton = false) => {
    setOpen(false)
    if (focusButton) buttonRef.current?.focus()
  }

  const selectOption = (option) => {
    onChange?.(option.value)
    closeMenu(true)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) return openMenu()
      setActiveIndex((index) => (index + 1) % options.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) return openMenu()
      setActiveIndex((index) => (index - 1 + options.length) % options.length)
    } else if (event.key === 'Home') {
      if (!open) return
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End') {
      if (!open) return
      event.preventDefault()
      setActiveIndex(options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) return openMenu()
      const option = options[activeIndex]
      if (option) selectOption(option)
    } else if (event.key === 'Escape') {
      if (!open) return
      event.preventDefault()
      event.stopPropagation()
      closeMenu(true)
    } else if (event.key === 'Tab') {
      if (open) setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-option-${activeIndex}` : undefined}
        aria-label={label}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex h-9 w-full items-center gap-2 rounded bg-cream-50 px-3 text-left text-[12px] font-medium text-brown-700 outline-none transition-colors hover:bg-cream-100 focus-visible:ring-2 focus-visible:ring-rust-500/30 aria-expanded:bg-white ${buttonClassName}`}
      >
        {icon && <span className="shrink-0 text-brown-500">{icon}</span>}
        <span className="grid min-w-0 flex-1 overflow-hidden text-left">
          {options.map((option) => (
            <span
              key={option.value}
              aria-hidden="true"
              className="invisible col-start-1 row-start-1 truncate"
            >
              {option.label}
            </span>
          ))}
          <span
            className={`col-start-1 row-start-1 truncate ${
              selected ? '' : 'text-brown-500'
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-brown-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          className={`absolute top-full z-30 mt-1 max-h-80 w-max min-w-full max-w-[280px] overflow-y-auto scrollbar-custom rounded-lg bg-canvas p-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                id={`${listId}-option-${index}`}
                aria-selected={isSelected}
                tabIndex={-1}
                data-index={index}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[12px] outline-none transition-colors ${
                  isSelected
                    ? 'bg-rust-600 font-semibold text-cream-50'
                    : isActive
                      ? 'bg-cream-200 text-brown-900'
                      : 'text-brown-700'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
