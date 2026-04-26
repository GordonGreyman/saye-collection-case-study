import type { ArchiveItem } from '@/lib/types'
import type { RelatedArchiveItem } from '@/features/archive/actions'
import { getMockPersonaById } from '@/features/discover/mockPersonas'

function canvas(
  blocks: Array<{ id: string; type: 'text' | 'image' | 'link'; content: string }>,
  thumbnail?: string,
): string {
  const json: Record<string, unknown> = { _v: 1, blocks }
  if (thumbnail) json.thumbnail = thumbnail
  return JSON.stringify(json)
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&auto=format&q=78`

const MOCK_ARCHIVE_ITEMS: ArchiveItem[] = [

  // ─── Lyra Santos · Photographer · São Paulo ──────────────────────────────
  {
    id: 'mock-lyra-1',
    profile_id: 'demo-artist-lyra-santos',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1511795409834-ef04bbd61622') },
        { id: 'b2', type: 'text', content: 'Metrô Sé, 2025' },
        { id: 'b3', type: 'text', content: 'Seventy-two faces in one frame. None of them looking at the camera. I keep returning to this platform at 7:14 a.m. — the specific quality of movement when bodies are late for something.' },
      ],
      u('1511795409834-ef04bbd61622'),
    ),
    created_at: '2026-04-10T08:20:00.000Z',
  },
  {
    id: 'mock-lyra-2',
    profile_id: 'demo-artist-lyra-santos',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'On the grammar of disappearance' },
      { id: 'b2', type: 'text', content: 'Every photograph is a document of something that no longer exists. This is not a melancholy observation — it is a technical fact. The light that struck the sensor is gone. The air that held those shapes has moved on.' },
      { id: 'b3', type: 'text', content: 'What remains is a signal. My question: can a signal be inhabited?\n\nI have spent three years photographing the periphery of São Paulo at dawn, when the city is still negotiating with itself. The images I make there feel neither documentary nor fiction. They sit in the suspension between a thing that happened and its interpretation — which is, I think, where all photographs live, whether or not they admit it.' },
    ]),
    created_at: '2026-03-18T11:45:00.000Z',
  },
  {
    id: 'mock-lyra-3',
    profile_id: 'demo-artist-lyra-santos',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://aperture.org/editorial/documentary-photography-today/' },
      { id: 'b2', type: 'text', content: 'Aperture on documentary today' },
      { id: 'b3', type: 'text', content: 'The question of what "bearing witness" means when every surface already has a camera embedded in it.' },
    ]),
    created_at: '2026-02-27T14:10:00.000Z',
  },
  {
    id: 'mock-lyra-4',
    profile_id: 'demo-artist-lyra-santos',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1516450360452-9312f5e86fc7') },
        { id: 'b2', type: 'text', content: 'Linha 3 (Vermelha), Series' },
        { id: 'b3', type: 'text', content: 'Still processing these from the October trip. Ilford HP5, pushed two stops. There is something in the grain that I cannot get any other way.' },
      ],
      u('1516450360452-9312f5e86fc7'),
    ),
    created_at: '2026-01-29T09:00:00.000Z',
  },

  // ─── Noah Braun · Installation · Berlin ──────────────────────────────────
  {
    id: 'mock-noah-1',
    profile_id: 'demo-artist-noah-braun',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1518998053901-5348d3961a04') },
        { id: 'b2', type: 'text', content: 'Signal/Noise, HAU Berlin 2026' },
        { id: 'b3', type: 'text', content: '64 transducers, architectural concrete, 18-minute composition. The room itself becomes the speaker. Visitors described it as being inside a listening.' },
      ],
      u('1518998053901-5348d3961a04'),
    ),
    created_at: '2026-04-05T16:00:00.000Z',
  },
  {
    id: 'mock-noah-2',
    profile_id: 'demo-artist-noah-braun',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Notes on resonance' },
      { id: 'b2', type: 'text', content: 'I am interested in the frequencies that structures already contain — the hum a building makes at rest, the subsonic drift of climate systems through glass. Before I compose anything, I listen to the room for three days.' },
      { id: 'b3', type: 'text', content: 'The work is not about imposing sound on space. It is about revealing what the space has been saying this whole time, to no one in particular.\n\n> "Silence is not the absence of sound. Silence is the sound of something being withheld."' },
    ]),
    created_at: '2026-03-02T10:20:00.000Z',
  },
  {
    id: 'mock-noah-3',
    profile_id: 'demo-artist-noah-braun',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.e-flux.com/journal/sound-art-architecture/' },
      { id: 'b2', type: 'text', content: 'Sound art and built space — e-flux' },
      { id: 'b3', type: 'text', content: 'This piece clarified something I had been circling for years about the relationship between sonic practice and architectural experience.' },
    ]),
    created_at: '2026-02-11T13:30:00.000Z',
  },
  {
    id: 'mock-noah-4',
    profile_id: 'demo-artist-noah-braun',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1558618666-fcd25c85cd64') },
        { id: 'b2', type: 'text', content: 'Responsive light component, studio test' },
        { id: 'b3', type: 'text', content: 'Colour temperature shifts in response to air pressure readings — this is from a 40mbar drop at 3 a.m.' },
      ],
      u('1558618666-fcd25c85cd64'),
    ),
    created_at: '2026-01-14T03:40:00.000Z',
  },

  // ─── Amina Yusuf · Digital Art · Lagos ───────────────────────────────────
  {
    id: 'mock-amina-1',
    profile_id: 'demo-artist-amina-yusuf',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1541961017774-22349e4a1262') },
        { id: 'b2', type: 'text', content: 'MOTHERBOARD III, 2026' },
        { id: 'b3', type: 'text', content: 'Digital print on metallic substrate, 120 × 160 cm. Third in the series interrogating what the body becomes when it learns to be rendered.' },
      ],
      u('1541961017774-22349e4a1262'),
    ),
    created_at: '2026-04-18T12:00:00.000Z',
  },
  {
    id: 'mock-amina-2',
    profile_id: 'demo-artist-amina-yusuf',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'What Afrofuturism owes the present' },
      { id: 'b2', type: 'text', content: 'The mistake is to treat Afrofuturism as an escape from now. It is not. It is a leverage point — a way of standing in the present with enough imagined altitude to see what the current arrangement actually looks like from outside it.' },
      { id: 'b3', type: 'text', content: 'When I make work, I am not leaving Lagos. I am asking: what does Lagos look like from 200 years forward, and what does that perspective demand of me today?\n\nThe answer is never comfortable. The answer is always: more.' },
    ]),
    created_at: '2026-03-25T09:15:00.000Z',
  },
  {
    id: 'mock-amina-3',
    profile_id: 'demo-artist-amina-yusuf',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.frieze.com/article/what-afrofuturism-means-now' },
      { id: 'b2', type: 'text', content: 'What Afrofuturism means now — Frieze' },
      { id: 'b3', type: 'text', content: 'Futures as political practice — not escapism, not nostalgia, but a form of pressure applied to the present.' },
    ]),
    created_at: '2026-02-20T15:50:00.000Z',
  },
  {
    id: 'mock-amina-4',
    profile_id: 'demo-artist-amina-yusuf',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1506703789020-a51dbb4c0991') },
        { id: 'b2', type: 'text', content: 'WEAVE series — texture tests' },
        { id: 'b3', type: 'text', content: 'Sourcing patterns from historical Aso-oke weave documentation and running them through a diffusion model not designed for this. The errors are the point.' },
      ],
      u('1506703789020-a51dbb4c0991'),
    ),
    created_at: '2026-01-08T20:30:00.000Z',
  },

  // ─── Elio Marin · Ceramics · Mexico City ─────────────────────────────────
  {
    id: 'mock-elio-1',
    profile_id: 'demo-artist-elio-marin',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1565193566173-7a0ee3dbe261') },
        { id: 'b2', type: 'text', content: 'Talavera clay, Oaxaca, 2026' },
        { id: 'b3', type: 'text', content: 'The material has a memory that precedes me by several centuries. My job is to not interfere with that memory more than necessary.' },
      ],
      u('1565193566173-7a0ee3dbe261'),
    ),
    created_at: '2026-04-02T07:30:00.000Z',
  },
  {
    id: 'mock-elio-2',
    profile_id: 'demo-artist-elio-marin',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'On firing and forgetting' },
      { id: 'b2', type: 'text', content: 'The kiln is a place where the maker surrenders. You set the temperature, you control the atmosphere — reduction, oxidation — but ultimately the clay decides. Every firing is a negotiation with physics, and physics does not negotiate.' },
      { id: 'b3', type: 'text', content: 'I have destroyed more pots than I have kept. This is not a failure statistic. It is the condition of working with material that has its own opinions.\n\nThe pots I keep are the ones where my opinion and the clay\'s opinion arrived at the same place by different routes.' },
    ]),
    created_at: '2026-03-10T11:00:00.000Z',
  },
  {
    id: 'mock-elio-3',
    profile_id: 'demo-artist-elio-marin',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.tate.org.uk/art/artists/ceramics' },
      { id: 'b2', type: 'text', content: 'Tate ceramics collection notes' },
      { id: 'b3', type: 'text', content: 'Useful for understanding the canon you are working against — or with, depending on the day.' },
    ]),
    created_at: '2026-02-03T16:20:00.000Z',
  },
  {
    id: 'mock-elio-4',
    profile_id: 'demo-artist-elio-marin',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1578662996442-48f60103fc96') },
        { id: 'b2', type: 'text', content: 'Post-firing, 2025 batch' },
        { id: 'b3', type: 'text', content: 'Natural ash glaze from wood firing — the colour comes from the kiln atmosphere, not from any glaze I applied. Seven hours of reduction to get here.' },
      ],
      u('1578662996442-48f60103fc96'),
    ),
    created_at: '2025-12-20T14:00:00.000Z',
  },

  // ─── Sofia Riedel · Curator · Amsterdam ──────────────────────────────────
  {
    id: 'mock-sofia-1',
    profile_id: 'demo-curator-sofia-riedel',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Exhibition notes: "After the Image"' },
      { id: 'b2', type: 'text', content: 'This programme began with a question I could not answer: what happens to lens-based practice when every surface is already a camera?' },
      { id: 'b3', type: 'text', content: 'The four artists in this exhibition are not answering that question. They are living inside it — making work that treats the question as a condition rather than a problem to be solved.\n\nThe show runs through June at Foam, Amsterdam. Free admission on Thursdays.' },
    ]),
    created_at: '2026-04-14T10:00:00.000Z',
  },
  {
    id: 'mock-sofia-2',
    profile_id: 'demo-curator-sofia-riedel',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1594608661623-aa0bd3a69d98') },
        { id: 'b2', type: 'text', content: '"After the Image" — Foam Amsterdam, 2026' },
        { id: 'b3', type: 'text', content: 'The room belongs to Kenji Nakamura\'s floor-level projection work. Visitors spend longer here than anywhere else in the show.' },
      ],
      u('1594608661623-aa0bd3a69d98'),
    ),
    created_at: '2026-04-01T13:00:00.000Z',
  },
  {
    id: 'mock-sofia-3',
    profile_id: 'demo-curator-sofia-riedel',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.foam.org/magazine' },
      { id: 'b2', type: 'text', content: 'Foam Magazine' },
      { id: 'b3', type: 'text', content: 'Consistently the most rigorous writing on contemporary photography. The pedagogy issue from last autumn is essential.' },
    ]),
    created_at: '2026-02-28T09:40:00.000Z',
  },
  {
    id: 'mock-sofia-4',
    profile_id: 'demo-curator-sofia-riedel',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Teaching with images you cannot fully explain' },
      { id: 'b2', type: 'text', content: 'I run a seminar at the Rijksakademie on photographic ambiguity — images that refuse the readings you bring to them. Students find this uncomfortable at first. They have been trained to explain, to contextualize, to produce meaning on demand.' },
      { id: 'b3', type: 'text', content: 'The discomfort is the curriculum.\n\nThe images I use are not illustrative. They are adversarial. I want students to encounter a photograph that is more than they can currently account for — and to sit with that deficit rather than paper it over with the first interpretation that arrives.' },
    ]),
    created_at: '2026-01-22T15:30:00.000Z',
  },

  // ─── Haruto Kim · Curator · Seoul ────────────────────────────────────────
  {
    id: 'mock-haruto-1',
    profile_id: 'demo-curator-haruto-kim',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Curatorial statement, 2026' },
      { id: 'b2', type: 'text', content: 'I curate at the intersection of urban photography and institutional memory. The city is an archive that no one appointed, maintained by the collective habit of looking. My work is to make that habit visible.' },
      { id: 'b3', type: 'text', content: 'Current research: the photographic documentation of Seoul\'s demolition cycles between 1970 and 2010 — forty years in which the city was rebuilt three times over. The photographs from this period are both records and symptoms.' },
    ]),
    created_at: '2026-04-07T11:20:00.000Z',
  },
  {
    id: 'mock-haruto-2',
    profile_id: 'demo-curator-haruto-kim',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1499932334307-55fa47bb0e08') },
        { id: 'b2', type: 'text', content: '"City Without a Past" — SeMA Nanji, Seoul 2025' },
        { id: 'b3', type: 'text', content: 'Approximately 4,000 photographs arranged chronologically. The gaps are as important as the images. Several decades are almost entirely unrepresented.' },
      ],
      u('1499932334307-55fa47bb0e08'),
    ),
    created_at: '2026-03-15T09:50:00.000Z',
  },
  {
    id: 'mock-haruto-3',
    profile_id: 'demo-curator-haruto-kim',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.moma.org/collection/terms/documentary-photography' },
      { id: 'b2', type: 'text', content: 'MoMA on documentary photography' },
      { id: 'b3', type: 'text', content: 'The institutional category and its limitations. The term carries more ideological weight than it usually admits.' },
    ]),
    created_at: '2026-02-15T14:45:00.000Z',
  },
  {
    id: 'mock-haruto-4',
    profile_id: 'demo-curator-haruto-kim',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Urban memory and the photographic archive' },
      { id: 'b2', type: 'text', content: 'Currently working through Walter Benjamin\'s Arcades Project for the fourth time, this time alongside Rem Koolhaas on Seoul and the logic of urban tabula rasa.' },
      { id: 'b3', type: 'text', content: 'The tension between preservation and erasure — between the photograph as mourning and the photograph as evidence of prior existence — seems to be the central problem of urban image archives.\n\nNo resolution yet. But productive questions are worth more than premature conclusions.' },
    ]),
    created_at: '2025-12-28T16:00:00.000Z',
  },

  // ─── Zara Haddad · Curator · Cairo ───────────────────────────────────────
  {
    id: 'mock-zara-1',
    profile_id: 'demo-curator-zara-haddad',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Craft as knowledge production' },
      { id: 'b2', type: 'text', content: 'The critical frameworks we apply to craft — ornament, function, tradition — are almost entirely derived from Modernism\'s discomfort with the decorative. They tell us more about mid-century European art criticism than they do about ceramic practice in Fustat, or basketwork in the Nile Delta.' },
      { id: 'b3', type: 'text', content: 'I am interested in developing curatorial methodologies that allow craft objects to speak on their own epistemological terms — not as ethnographic specimens, not as design precursors, but as complete forms of knowledge.' },
    ]),
    created_at: '2026-04-16T10:30:00.000Z',
  },
  {
    id: 'mock-zara-2',
    profile_id: 'demo-curator-zara-haddad',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1509475826633-fed843e4b0ef') },
        { id: 'b2', type: 'text', content: '"Handed Down" catalogue, Cairo 2025' },
        { id: 'b3', type: 'text', content: 'Laid out and printed by workshop participants. The making of the document was part of the exhibition.' },
      ],
      u('1509475826633-fed843e4b0ef'),
    ),
    created_at: '2026-03-05T12:15:00.000Z',
  },
  {
    id: 'mock-zara-3',
    profile_id: 'demo-curator-zara-haddad',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.e-flux.com/journal/craft-contemporary-art/' },
      { id: 'b2', type: 'text', content: 'Craft within contemporary art discourse — e-flux' },
      { id: 'b3', type: 'text', content: 'This piece helped me articulate what I had been doing without a name for it.' },
    ]),
    created_at: '2026-01-30T09:00:00.000Z',
  },
  {
    id: 'mock-zara-4',
    profile_id: 'demo-curator-zara-haddad',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Workshop notes, February 2026' },
      { id: 'b2', type: 'text', content: 'Thirteen participants. Five different first languages. One shared material: slip-cast porcelain from a supplier in Helwan that has been operating for sixty years.' },
      { id: 'b3', type: 'text', content: 'We spent the first session not making anything — just handling the raw clay, describing it to each other. I learned this from a ceramicist in Fez who said: "You cannot make from a material you haven\'t mourned yet."' },
    ]),
    created_at: '2025-12-15T13:45:00.000Z',
  },

  // ─── Miles Owens · Curator · New York ────────────────────────────────────
  {
    id: 'mock-miles-1',
    profile_id: 'demo-curator-miles-owens',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Expanded Cinema, Reduced Attention' },
      { id: 'b2', type: 'text', content: 'This season\'s moving-image programme at the Shed takes its title from a provocation: what happens to expanded cinema\'s claims for duration and immersion when audiences are physiologically incapable of sustained attention?' },
      { id: 'b3', type: 'text', content: 'The three artists in this programme are not making work about attention. They are making work that actively requires it — that withholds its meaning from viewers who move through quickly.\n\nPatience is not a passive state. The programme opens March 4.' },
    ]),
    created_at: '2026-03-01T11:00:00.000Z',
  },
  {
    id: 'mock-miles-2',
    profile_id: 'demo-curator-miles-owens',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.artforum.com/film/' },
      { id: 'b2', type: 'text', content: 'Artforum film section' },
      { id: 'b3', type: 'text', content: 'The best pieces on experimental and artists\' film remain the standard for this kind of criticism.' },
    ]),
    created_at: '2026-02-18T16:30:00.000Z',
  },
  {
    id: 'mock-miles-3',
    profile_id: 'demo-curator-miles-owens',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1485846234645-a62644f84728') },
        { id: 'b2', type: 'text', content: 'Park Soo-Yeon, "Interval", 2025' },
        { id: 'b3', type: 'text', content: 'Single channel video, 47 minutes. The whole film is a single take of a window at night. For the first twenty minutes nothing happens. Then something does.' },
      ],
      u('1485846234645-a62644f84728'),
    ),
    created_at: '2026-01-20T14:00:00.000Z',
  },
  {
    id: 'mock-miles-4',
    profile_id: 'demo-curator-miles-owens',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'On the interdisciplinary fallacy' },
      { id: 'b2', type: 'text', content: '"Interdisciplinary" has become the safe word of institutional programming — a way of gesturing at complexity without committing to the specific discomforts that actual cross-disciplinary work produces.' },
      { id: 'b3', type: 'text', content: 'Genuinely interdisciplinary work is not the sum of its inputs. It is the friction between them. It requires that each discipline give up some of its methodological sovereignty.\n\nThe collisions are the work.' },
    ]),
    created_at: '2025-12-10T10:15:00.000Z',
  },

  // ─── Riverfront Lab · Institution · London ───────────────────────────────
  {
    id: 'mock-riverfront-1',
    profile_id: 'demo-institution-riverfront-lab',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Open Call: Research Residency 2026–27' },
      { id: 'b2', type: 'text', content: 'Riverfront Lab invites applications for its annual research residency. We support artists and writers whose practice involves sustained critical inquiry — into materials, institutions, archives, communities, or questions that do not yet have disciplines.' },
      { id: 'b3', type: 'text', content: 'Residencies are 3 months. Studio, accommodation, and a production budget of £4,000 are provided. No output is required. We mean this.\n\nDeadline: 30 June 2026.' },
    ]),
    created_at: '2026-04-20T09:00:00.000Z',
  },
  {
    id: 'mock-riverfront-2',
    profile_id: 'demo-institution-riverfront-lab',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1486325212027-8081e485255e') },
        { id: 'b2', type: 'text', content: 'The building, Bermondsey' },
        { id: 'b3', type: 'text', content: 'Former tannery, now four studios, a print workshop, a darkroom, and one room we have never fully decided the purpose of. Residents tend to find its purpose on arrival.' },
      ],
      u('1486325212027-8081e485255e'),
    ),
    created_at: '2026-03-12T11:30:00.000Z',
  },
  {
    id: 'mock-riverfront-3',
    profile_id: 'demo-institution-riverfront-lab',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.serpentinegalleries.org/whats-on/serpentine-reports/' },
      { id: 'b2', type: 'text', content: 'Serpentine Reports' },
      { id: 'b3', type: 'text', content: 'One of the better models for what institutional publishing looks like when it serves the field rather than the institution\'s reputation.' },
    ]),
    created_at: '2026-02-05T14:20:00.000Z',
  },
  {
    id: 'mock-riverfront-4',
    profile_id: 'demo-institution-riverfront-lab',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Resident spotlight: Amara Nnaji, 2025–26' },
      { id: 'b2', type: 'text', content: 'Amara arrived in September with a question about photographic archives and institutional authority. She is leaving in June with a 200-page manuscript, a series of large-format prints, and a practice that is substantially larger than the one she brought.' },
      { id: 'b3', type: 'text', content: 'This is what we are for. We do not produce outcomes. We produce conditions.' },
    ]),
    created_at: '2026-01-10T10:00:00.000Z',
  },

  // ─── Atlas Program · Institution · Paris ─────────────────────────────────
  {
    id: 'mock-atlas-1',
    profile_id: 'demo-institution-atlas-program',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1558769132-cb1aea153895') },
        { id: 'b2', type: 'text', content: 'Yemi Adeyinka — Atlas × Palais de Tokyo, 2026' },
        { id: 'b3', type: 'text', content: 'Textile commission addressing the supply chain of fast fashion using materials sourced from the chain itself.' },
      ],
      u('1558769132-cb1aea153895'),
    ),
    created_at: '2026-04-12T13:00:00.000Z',
  },
  {
    id: 'mock-atlas-2',
    profile_id: 'demo-institution-atlas-program',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'About the Atlas Program' },
      { id: 'b2', type: 'text', content: 'Atlas was founded in 2019 on a refusal: we refused to separate fashion from art, design from criticality, commercial from conceptual.' },
      { id: 'b3', type: 'text', content: 'We work with practitioners whose practice does not fit the institutional categories available to it. Our programme is a commission structure, not an exhibition schedule. We fund making, not showing. The showing is a by-product.' },
    ]),
    created_at: '2026-03-22T10:00:00.000Z',
  },
  {
    id: 'mock-atlas-3',
    profile_id: 'demo-institution-atlas-program',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.dezeen.com/tag/fashion-art/' },
      { id: 'b2', type: 'text', content: 'Fashion-art — Dezeen' },
      { id: 'b3', type: 'text', content: 'The 2025 round-up of hybrid practices was the most thorough survey we have seen of the field we are trying to build.' },
    ]),
    created_at: '2026-01-17T15:00:00.000Z',
  },
  {
    id: 'mock-atlas-4',
    profile_id: 'demo-institution-atlas-program',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1518621736915-f3b1c41bfd00') },
        { id: 'b2', type: 'text', content: 'Laure Delmas — generative commission, 2025' },
        { id: 'b3', type: 'text', content: 'Built from three years of runway footage. The system learns what "movement" means from the data and then refuses to reproduce it exactly.' },
      ],
      u('1518621736915-f3b1c41bfd00'),
    ),
    created_at: '2025-12-05T11:30:00.000Z',
  },

  // ─── Tidehouse Contemporary · Institution · Tokyo ─────────────────────────
  {
    id: 'mock-tidehouse-1',
    profile_id: 'demo-institution-tidehouse',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1440404653325-ab127d49abc1') },
        { id: 'b2', type: 'text', content: 'Ryu Mitsuki, "Undertow", Tidehouse 2026' },
        { id: 'b3', type: 'text', content: 'Water sound spatialized across 32 channels. Humidity sensors adjust the room temperature in response to the number of bodies present.' },
      ],
      u('1440404653325-ab127d49abc1'),
    ),
    created_at: '2026-04-08T14:00:00.000Z',
  },
  {
    id: 'mock-tidehouse-2',
    profile_id: 'demo-institution-tidehouse',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Commissions Open 2026' },
      { id: 'b2', type: 'text', content: 'Tidehouse is now accepting proposals for our 2027 commission programme. We are particularly interested in works that require the building — that could not exist somewhere else, or that would be meaningfully different somewhere else.' },
      { id: 'b3', type: 'text', content: 'Budgets range from ¥1.2M to ¥6M depending on scale. Proposals due 31 August.\n\nInformation in Japanese and English at tidehousecontemporary.jp/commissions.' },
    ]),
    created_at: '2026-03-28T09:30:00.000Z',
  },
  {
    id: 'mock-tidehouse-3',
    profile_id: 'demo-institution-tidehouse',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.e-flux.com/journal/performance-and-space/' },
      { id: 'b2', type: 'text', content: 'Performance and architectural space — e-flux' },
      { id: 'b3', type: 'text', content: 'The distinction between site-specific and site-responsive work — it matters more than most institutions admit.' },
    ]),
    created_at: '2026-02-09T13:00:00.000Z',
  },
  {
    id: 'mock-tidehouse-4',
    profile_id: 'demo-institution-tidehouse',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1508700115892-45ecd05ae426') },
        { id: 'b2', type: 'text', content: 'Tomoko Inoue, performance documentation, 2025' },
        { id: 'b3', type: 'text', content: 'The work lasted four hours. She described it afterward as "a conversation with the room\'s patience."' },
      ],
      u('1508700115892-45ecd05ae426'),
    ),
    created_at: '2025-11-30T20:00:00.000Z',
  },

  // ─── Open Courtyard · Institution · Nairobi ───────────────────────────────
  {
    id: 'mock-opencourt-1',
    profile_id: 'demo-institution-open-courtyard',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Craft & Practice Fellowship 2026 — Open Call' },
      { id: 'b2', type: 'text', content: 'Open Courtyard invites craftspeople and artists working in the Nairobi region to apply for our six-month fellowship. Fellows receive a monthly stipend, shared workshop access, peer mentorship, and support for a public project.' },
      { id: 'b3', type: 'text', content: 'No formal qualifications required. Experience and commitment to a practice are what we look for.\n\nDeadline 15 July 2026.' },
    ]),
    created_at: '2026-04-22T08:00:00.000Z',
  },
  {
    id: 'mock-opencourt-2',
    profile_id: 'demo-institution-open-courtyard',
    type: 'image',
    content: canvas(
      [
        { id: 'b1', type: 'image', content: u('1503023345310-bd7c1de61c7d') },
        { id: 'b2', type: 'text', content: 'Saturday weaving workshop, Mathare' },
        { id: 'b3', type: 'text', content: 'Fourteen participants, seven looms, three facilitators. The oldest participant is 71. The youngest is 11. They are teaching each other.' },
      ],
      u('1503023345310-bd7c1de61c7d'),
    ),
    created_at: '2026-03-08T10:00:00.000Z',
  },
  {
    id: 'mock-opencourt-3',
    profile_id: 'demo-institution-open-courtyard',
    type: 'link',
    content: canvas([
      { id: 'b1', type: 'link', content: 'https://www.goethe.de/en/kul/bku/prj/cae.html' },
      { id: 'b2', type: 'text', content: 'Creative Africa Exchange — Goethe-Institut' },
      { id: 'b3', type: 'text', content: 'A useful model for transnational craft exchange without the extractive dynamics that so often accompany it.' },
    ]),
    created_at: '2026-01-25T12:30:00.000Z',
  },
  {
    id: 'mock-opencourt-4',
    profile_id: 'demo-institution-open-courtyard',
    type: 'text',
    content: canvas([
      { id: 'b1', type: 'text', content: 'Fellow voice: Wanjiku Njoroge, 2025 cohort' },
      { id: 'b2', type: 'text', content: '"I came here knowing how to weave. I left knowing what weaving is for. Those are different kinds of knowledge. The Courtyard is where I learned that they are both necessary."' },
      { id: 'b3', type: 'text', content: '"I am now teaching in Kibera, which is where I am from. The teaching is the continuation of the practice, not a break from it."' },
    ]),
    created_at: '2025-12-01T09:00:00.000Z',
  },
]

export function getMockArchiveItemsForProfile(profileId: string): ArchiveItem[] {
  return MOCK_ARCHIVE_ITEMS.filter(item => item.profile_id === profileId)
}

export function isMockProfileId(profileId: string): boolean {
  return profileId.startsWith('demo-')
}

export function getRelatedMockArchiveItems(
  excludeProfileId: string,
  limit = 6,
): RelatedArchiveItem[] {
  return MOCK_ARCHIVE_ITEMS.filter(item => item.profile_id !== excludeProfileId)
    .slice(0, limit)
    .map(item => {
      const persona = getMockPersonaById(item.profile_id)
      return {
        ...item,
        profiles: persona ? { display_name: persona.display_name, role: persona.role } : null,
      }
    })
}

export function getMockProfileArchiveItems(
  profileId: string,
  excludeItemId: string,
  limit = 6,
): RelatedArchiveItem[] {
  return MOCK_ARCHIVE_ITEMS.filter(
    item => item.profile_id === profileId && item.id !== excludeItemId,
  )
    .slice(0, limit)
    .map(item => {
      const persona = getMockPersonaById(item.profile_id)
      return {
        ...item,
        profiles: persona ? { display_name: persona.display_name, role: persona.role } : null,
      }
    })
}
