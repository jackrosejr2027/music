(function(){
  'use strict';
  var mobileView = false;
  try { mobileView = sessionStorage.getItem('st_mobile_view') === '1'; } catch (error) {}
  var viewToggle = document.getElementById('mobile-view-toggle');
  function syncMobileView() {
    document.body.classList.toggle('mobile-view', mobileView);
    if (!viewToggle) return;
    viewToggle.setAttribute('aria-pressed', String(mobileView));
    viewToggle.textContent = mobileView ? 'Desktop view' : 'Mobile view';
  }
  syncMobileView();
  if (viewToggle) viewToggle.addEventListener('click', function () {
    mobileView = !mobileView;
    try { sessionStorage.setItem('st_mobile_view', mobileView ? '1' : '0'); } catch (error) {}
    syncMobileView();
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('../sw.js').catch(function (error) { console.warn('Offline worker registration failed:', error); });
  }
  var cards=[
    {q:'What is an interval?',a:'The distance in pitch between two notes.'},
    {q:'How many semitones are in an octave?',a:'12 semitones.'},
    {q:'What is a major scale formula?',a:'Whole, whole, half, whole, whole, whole, half.'},
    {q:'What notes make a major triad?',a:'The root, major third, and perfect fifth.'},
    {q:'What is the relative minor of a major key?',a:'The minor key starting on the sixth degree of the major scale.'},
    {q:'What is a perfect fifth?',a:'An interval spanning 7 semitones.'},
    {q:'What does a sharp do?',a:'Raises a note by one semitone.'},
    {q:'What does a flat do?',a:'Lowers a note by one semitone.'},
    {q:'What is a key signature?',a:'The sharps or flats that apply throughout a piece.'},
    {q:'What is the root of a chord?',a:'The note that names the chord and anchors its structure.'},
    {q:'What is a minor triad formula?',a:'Root, minor third, and perfect fifth.'},
    {q:'What is the circle of fifths useful for?',a:'Seeing key relationships and how many sharps or flats each key has.'}
  ];
  if (typeof MusicTheory === 'function') {
    const theory = new MusicTheory();
    const scales = Object.entries(theory.scales)
      .filter(([, data]) => data && Array.isArray(data.intervals) && data.intervals.length)
      .sort((a, b) => a[1].name.localeCompare(b[1].name) || a[0].localeCompare(b[0]))
      .slice(0, 300);
    scales.forEach(([id, data]) => {
      cards.push({
        q: 'What interval formula defines ' + data.name + '?',
        a: data.intervals.join(' - '),
        category: 'Scales'
      });
    });

    const chords = Object.entries(theory.chords)
      .filter(([, data]) => data && Array.isArray(data.intervals) && data.intervals.length)
      .sort((a, b) => a[1].name.localeCompare(b[1].name) || a[0].localeCompare(b[0]))
      .slice(0, 75);
    chords.forEach(([id, data]) => {
      const name = data.name + ' (' + id + ')';
      const formula = data.intervals;
      const formulaText = formula.join(' - ');
      const base0 = Array.from(new Set([0].concat(formula.map(iv => theory.getIntervalSemitones(iv))
        .filter(value => value !== null)
        .map(value => ((value % 12) + 12) % 12)))).sort((a, b) => a - b).join('-');
      const notes = theory.getChordNotes('C', id).join(' - ');
      cards.push(
        { q: 'Spell ' + name + ' from C.', a: notes + ' (formula: ' + formulaText + ')', category: 'Chords' },
        { q: 'What interval formula builds ' + name + '?', a: formulaText, category: 'Chords' },
        { q: 'What is the Base-0 pitch-class set for ' + name + '?', a: base0, category: 'Chords' },
        { q: 'Which chord (' + id + ') has the formula ' + formulaText + '?', a: name, category: 'Chords' }
      );
    });
    const baseCount = cards.length;
    const spellKeys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    const scaleCandidates = Object.entries(theory.scales)
      .filter(([, data]) => data && Array.isArray(data.intervals) && data.intervals.length)
      .flatMap(([id, data]) => spellKeys.map(key => ({ id, data, key, notes: theory.getScaleNotes(key, id) })))
      .filter(item => item.notes && item.notes.length);
    const chordCandidates = Object.entries(theory.chords)
      .filter(([, data]) => data && Array.isArray(data.intervals) && data.intervals.length)
      .flatMap(([id, data]) => spellKeys.map(key => ({ id, data, key, notes: theory.getChordNotes(key, id) })))
      .filter(item => item.notes && item.notes.length);
    function spread(candidates, count) {
      return Array.from({ length: Math.min(count, candidates.length) }, (_, i) => candidates[Math.floor((i + 0.5) * candidates.length / count)]);
    }
    spread(scaleCandidates, 500).forEach(({ id, data, key, notes }) => {
      cards.push({
        q: 'Spell the ' + data.name + ' scale (' + id + ') in ' + key + '.',
        a: notes.join(' - ') + ' (formula: ' + data.intervals.join(' - ') + ')',
        category: 'Scale spellings'
      });
    });
    spread(chordCandidates, 500).forEach(({ id, data, key, notes }) => {
      cards.push({
        q: 'Build the ' + data.name + ' chord (' + id + ') from ' + key + '.',
        a: notes.join(' - ') + ' (formula: ' + data.intervals.join(' - ') + ')',
        category: 'Chord spellings'
      });
    });
    if (cards.length !== baseCount + 1000) console.warn('Theory card expansion expected 1000 cards; added ' + (cards.length - baseCount));

    const seenQuestions = new Set(cards.map(card => card.q));
    const appliedCards = [];
    const addAppliedCard = card => {
      if (appliedCards.length >= 1388 || seenQuestions.has(card.q)) return;
      seenQuestions.add(card.q);
      card.category = 'Applied theory';
      appliedCards.push(card);
    };
    const scaleIndex = note => {
      const sharp = theory.toSharp(note);
      return theory.notes.indexOf(sharp);
    };
    const ordinal = number => {
      const mod100 = number % 100;
      return number + (mod100 >= 11 && mod100 <= 13 ? 'th' : ({1:'st',2:'nd',3:'rd'}[number % 10] || 'th'));
    };
    const rowCount = Math.max(scaleCandidates.length, chordCandidates.length);
    for (let i = 0; i < rowCount && appliedCards.length < 1388; i++) {
      const scale = scaleCandidates[i];
      if (scale) {
        const { id, data, key, notes } = scale;
        const name = data.name + ' (' + id + ')';
        const rootIndex = scaleIndex(key);
        const noteIndices = notes.map(scaleIndex);
        const steps = noteIndices.map((pitch, index) => {
          const next = index + 1 < noteIndices.length ? noteIndices[index + 1] : rootIndex + 12;
          return String((next - pitch + 12) % 12 || 12);
        });
        const degreeIndex = notes.length > 1 ? 1 + (i % (notes.length - 1)) : 0;
        [
          { q: 'Spell ' + key + ' ' + name + ' in ascending order.', a: notes.join(' - ') },
          { q: 'In ' + key + ' ' + name + ', what pitch is scale degree ' + ordinal(degreeIndex + 1) + '?', a: notes[degreeIndex] },
          { q: 'What is the ordered interval formula for ' + key + ' ' + name + '?', a: data.intervals.join(' - ') },
          { q: 'What semitone step pattern returns ' + key + ' ' + name + ' to its octave?', a: steps.join(' - ') }
        ].forEach(addAppliedCard);
      }
      const chord = chordCandidates[i];
      if (chord && appliedCards.length < 1388) {
        const { id, data, key, notes } = chord;
        const name = data.name + ' (' + id + ')';
        const toneIndex = notes.length > 1 ? 1 + (i % (notes.length - 1)) : 0;
        const inversion = notes.length > 1 ? notes.slice(1).concat([notes[0] + ' (octave up)']) : notes;
        [
          { q: 'Spell the ' + key + ' ' + name + ' from its root upward.', a: notes.join(' - ') },
          { q: 'Which interval formula defines the ' + key + ' ' + name + '?', a: data.intervals.join(' - ') },
          { q: 'In the ' + key + ' ' + name + ', what pitch is chord tone ' + ordinal(toneIndex + 1) + '?', a: notes[toneIndex] },
          { q: 'Write the first-inversion tone order for the ' + key + ' ' + name + '.', a: inversion.join(' - ') }
        ].forEach(addAppliedCard);
      }
    }
    cards.push.apply(cards, appliedCards);
    if (appliedCards.length !== 1388) console.warn('Theory card expansion expected 1388 additional applied cards; added ' + appliedCards.length);
  }
  var index=0,flipped=false;
  var deckFilter=document.getElementById('deck-filter');
  var card=document.getElementById('flashcard');
  var text=document.getElementById('card-text');
  var label=document.getElementById('side-label');
  var hint=document.getElementById('card-hint');
  var count=document.getElementById('card-count');
  var progress=document.getElementById('progress');
  var favoriteButton=document.getElementById('favorite-card');
  var favoriteStatus=document.getElementById('favorite-card-status');
  function favoriteId(item){return (item.category || 'Foundations') + '|' + item.q;}
  function syncFavorite(){
    if(!favoriteButton || !cards.length) return;
    var item=getDeck()[index];
    var saved=!!(item && window.ST && ST.favorites && ST.favorites.has('theory-card',favoriteId(item)));
    favoriteButton.setAttribute('aria-pressed',String(saved));
    favoriteButton.textContent=saved?'★ Saved':'☆ Save card';
  }
  function getDeck(){
    var selected=deckFilter.value;
    return selected==='all'?cards:cards.filter(function(item){return (item.category || 'Foundations')===selected;});
  }
  function render(){
    var deck=getDeck();
    if(index>=deck.length) index=0;
    var item=deck[index];
    var category=document.getElementById('card-category');
    if(category) category.textContent=item.category || 'Foundations';
    text.textContent=flipped?item.a:item.q;
    label.textContent=flipped?'ANSWER':'PROMPT';
    hint.textContent=flipped?'Tap to see prompt':'Tap to reveal';
    count.textContent='CARD '+String(index+1).padStart(2,'0')+' / '+String(deck.length).padStart(2,'0');
    progress.textContent=(index+1)+' / '+deck.length;
    card.setAttribute('aria-label',flipped?'Show prompt':'Reveal answer');
    syncFavorite();
  }
  function move(delta){var deck=getDeck();index=(index+delta+deck.length)%deck.length;flipped=false;render();}
  deckFilter.addEventListener('change',function(){index=0;flipped=false;render();});
  card.addEventListener('click',function(){flipped=!flipped;render();});
  if(favoriteButton) favoriteButton.addEventListener('click',function(){
    var item=getDeck()[index];
    if(!item || !window.ST || !ST.favorites) return;
    var result=ST.favorites.toggle({type:'theory-card',id:favoriteId(item),title:item.q,href:'theory-cards/index.html?card='+encodeURIComponent(favoriteId(item)),data:{prompt:item.q,answer:item.a,category:item.category||'Foundations'}});
    if(favoriteStatus) favoriteStatus.textContent=result.ok?(result.saved?'Card saved to Favorites.':'Card removed from Favorites.'):'Could not save this card. Check device storage.';
    syncFavorite();
  });
  window.addEventListener('st:favoriteschange',syncFavorite);
  var requestedCard=new URLSearchParams(location.search).get('card');
  if(requestedCard){var foundIndex=cards.findIndex(function(item){return favoriteId(item)===requestedCard;});if(foundIndex>=0)index=foundIndex;}
  document.getElementById('previous').addEventListener('click',function(){move(-1);});
  document.getElementById('next').addEventListener('click',function(){move(1);});
  document.addEventListener('keydown',function(event){
    if(event.target.closest && event.target.closest('select,input,textarea,a,button:not(#flashcard)')) return;
    if(event.key==='ArrowLeft'){move(-1);}
    else if(event.key==='ArrowRight'){move(1);}
    else if(event.code==='Space'&&event.target!==card){event.preventDefault();flipped=!flipped;render();}
  });
  render();
})();