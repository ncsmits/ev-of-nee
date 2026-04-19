/**
 * LicensePlateInput — gestyled kentekeninvoerveld
 * Nederlands kentekenlook: geel vlak, blauw EU-blokje links, zwarte letters
 */
export default function LicensePlateInput({ value, onChange, onEnter }) {
  function handleChange(e) {
    // Verwijder koppeltekens bij invoer, hoofdletters
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    onChange(cleaned)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && onEnter) onEnter()
  }

  // Formatteer voor weergave: voeg koppeltekens in op juiste positie
  function formatDisplay(raw) {
    if (!raw) return ''
    // Eenvoudige weergave: toon altijd zonder koppeltekens in het invoerveld
    // Koppeltekens worden niet opgeslagen — alleen display
    return raw
  }

  return (
    <div className="flex items-center rounded-lg overflow-hidden border-2 border-neutral-900
                    focus-within:border-yellow-400 transition-colors shadow-sm"
         style={{ minWidth: '160px' }}>
      {/* EU-blokje */}
      <div className="bg-blue-700 px-2 py-2.5 flex flex-col items-center justify-center self-stretch">
        <span className="text-white text-[8px] leading-none font-bold">EU</span>
        <span className="text-yellow-300 text-[10px] leading-none mt-0.5">🇳🇱</span>
      </div>
      {/* Geel invoerveld */}
      <input
        type="text"
        value={formatDisplay(value)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={8}
        placeholder="GH-123-B"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        className="bg-yellow-300 text-neutral-900 font-bold text-lg tracking-widest
                   px-3 py-2 w-full outline-none placeholder-neutral-400/60
                   uppercase"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}
      />
    </div>
  )
}
