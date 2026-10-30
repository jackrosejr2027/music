/**
 * Exporter Info Pages Extension
 * Generates a comprehensive reference Word document containing educational pages.
 */
if (typeof Exporter !== 'undefined') {
    Exporter.exportInfoPagesToWord = async function(app) {
        if (typeof docx === 'undefined') {
            alert('docx library is not loaded. Cannot create Word document.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;
        const btn = document.getElementById('export-info-pages-word');
        const originalText = btn ? btn.textContent : 'Exporting...';
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Generating Document...';
        }

        const sections = [];

        // Helper for Section Headers
        const addHeading = (text, level = HeadingLevel.HEADING_1, pageBreak = false) => {
            sections.push(new Paragraph({
                text: text,
                heading: level,
                spacing: { before: 400, after: 200 },
                pageBreakBefore: pageBreak
            }));
        };

        // Helper for Standard Text
        const addText = (text, options = {}) => {
            sections.push(new Paragraph({
                children: [new TextRun({ text, ...options })],
                spacing: { after: 150 }
            }));
        };

        // 1. Title Page
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Scales Thesaurus", bold: true, size: 72 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 }
        }));
        sections.push(new Paragraph({
            children: [new TextRun({ text: "Musical Patterns & Theory Reference Guide", size: 36 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
        }));

        // 2. Introduction to Fretboard Diagrams
        addHeading("Introduction to Fretboard Diagrams", HeadingLevel.HEADING_1, true);
        addText("Fretboard diagrams are a visual representation of the neck of a stringed instrument, most commonly the guitar or bass. They show where to place your fingers to play specific notes, chords, or scales.");
        addText("• Strings: Vertical lines (or horizontal depending on orientation) representing the strings. Usually, the leftmost string is the thickest (lowest pitch).");
        addText("• Frets: The space between horizontal lines. Fret 0 is the nut (open strings).");
        addText("• Markers: Circles or shapes on the frets indicating which notes to play.");

        // 3. Introduction to Interval Patterns
        addHeading("Introduction to Interval Patterns", HeadingLevel.HEADING_1, true);
        addText("An interval is the distance between two musical pitches. In this application, intervals are the building blocks used to define every chord and scale.");
        addText("Intervals are defined by their semitone distance from a root note. For example, a 'Major 3rd' is 4 semitones away from the root.");

        // 4. Building Intervals
        addHeading("Building Intervals", HeadingLevel.HEADING_2);
        addText("To build an interval, identify your starting note (the Root) and move up the chromatic scale by a specific number of half-steps (semitones).");
        addText("Common Interval Construction:");
        addText("- Perfect 5th: 7 semitones (e.g., C to G)");
        addText("- Major 3rd: 4 semitones (e.g., C to E)");
        addText("- Minor 3rd: 3 semitones (e.g., C to Eb)");

        // 5. Reading Interval Names
        addHeading("Reading Interval Names", HeadingLevel.HEADING_2);
        addText("Interval names use a combination of numbers (2nd, 3rd, 4th, etc.) and qualities (Major, Minor, Perfect, Augmented, Diminished).");
        addText("- 'b' (Flat) prefix often indicates a minor or diminished interval.");
        addText("- '#' (Sharp) prefix often indicates an augmented interval.");

        // 6. Introduction to Chord Patterns
        addHeading("Introduction to Chord Patterns", HeadingLevel.HEADING_1, true);
        addText("A chord is a set of three or more notes played together. Chords are built by stacking intervals on top of a root note.");

        // 7. Building Chords
        addHeading("Building Chords", HeadingLevel.HEADING_2);
        addText("Basic chords (triads) are built using the 1st, 3rd, and 5th degrees of a scale:");
        addText("- Major Triad: 1 - 3 - 5");
        addText("- Minor Triad: 1 - b3 - 5");
        addText("- Diminished Triad: 1 - b3 - b5");
        addText("- Augmented Triad: 1 - 3 - #5");

        // 8. Reading Chord Names
        addHeading("Reading Chord Names", HeadingLevel.HEADING_2);
        addText("Chord names tell you the Root and the Quality. 'Cmaj7' means a C root with a Major 7th structure. 'Am' means an A root with a Minor structure.");

        // 9. Introduction to Scale Patterns
        addHeading("Introduction to Scale Patterns", HeadingLevel.HEADING_1, true);
        addText("A scale is a sequence of notes organized by pitch. Scales provide the melodic and harmonic palette for a piece of music.");

        // 10. Building Scales
        addHeading("Building Scales", HeadingLevel.HEADING_2);
        addText("Scales are built using formulas of whole steps (W) and half steps (H).");
        addText("- Major Scale: W - W - H - W - W - W - H");
        addText("- Natural Minor: W - H - W - W - H - W - W");

        // 11. Reading Scale Names
        addHeading("Reading Scale Names", HeadingLevel.HEADING_2);
        addText("Scales are often named after modes (Dorian, Mixolydian) or their cultural/functional origin (Pentatonic, Blues, Hungarian Minor).");

        // 12. Reading Fretboard Diagrams (Detailed)
        addHeading("Reading Fretboard Diagrams (Advanced)", HeadingLevel.HEADING_1, true);
        addText("In this app, circles represent notes. The letter or number inside the circle indicates the Note Name, the Interval, or the Solfège syllable based on your Display Mode settings.");

        // 13. Improvising and Soloing
        addHeading("Improvising and Soloing", HeadingLevel.HEADING_1, true);
        addText("To improvise, use the notes of a scale that matches the underlying chord progression. Use 'Melodic Patterns' to create interesting rhythmic and melodic contours rather than just playing straight up and down.");

        // 14. Major/Minor Keys
        addHeading("Major/Minor Keys", HeadingLevel.HEADING_2);
        addText("Most Western music is centered around a 'key'. A Major key feels stable and bright; a Minor key feels darker or more emotional.");

        // 15. Modes
        addHeading("Modes", HeadingLevel.HEADING_2);
        addText("Modes are variations of a parent scale. For example, the Dorian mode uses the same notes as a Major scale but starts on the 2nd degree, changing the 'home' note and the overall mood.");

        // 16. Chord-by-Chord Approach
        addHeading("Chord-by-Chord Approach", HeadingLevel.HEADING_2);
        addText("Advanced improvisers often play specifically to the notes of each individual chord as it passes (arpeggio-based soloing), rather than just using one scale for the whole progression.");

        // 17. Glossary
        addHeading("Glossary", HeadingLevel.HEADING_1, true);
        const terms = [
            ["Root", "The fundamental note upon which a chord or scale is built."],
            ["Semitone", "The smallest interval in Western music (one fret)."],
            ["Enharmonic", "Notes that sound the same but have different names (e.g., C# and Db)."],
            ["Diatonic", "Notes that belong naturally to a specific scale or key."],
            ["Chromatic", "Moving by half-steps; using all 12 available notes."]
        ];
        terms.forEach(t => addText(`• ${t[0]}: ${t[1]}`));

        // 18. Appendix A: All Intervals in App
        addHeading("Appendix A: Comprehensive Interval List", HeadingLevel.HEADING_1, true);
        Object.entries(app.musicTheory.intervals).forEach(([id, data]) => {
            addText(`- ${data.name} (${id}): ${data.semitones} semitones`);
        });

        // 19. Appendix B: All Chords and Scales
        addHeading("Appendix B: Reference Catalog", HeadingLevel.HEADING_1, true);
        addHeading("Available Chord Types", HeadingLevel.HEADING_2);
        Object.entries(app.musicTheory.chords).forEach(([id, data]) => {
            addText(`• ${data.name} [Formula: ${data.intervals.join('-')}]`);
        });
        
        addHeading("Available Scale Types", HeadingLevel.HEADING_2, true);
        Object.entries(app.musicTheory.scales).forEach(([id, data]) => {
            addText(`• ${data.name} [Formula: ${data.intervals.join('-')}]`);
        });

        // Finalize and Download
        try {
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: sections
                }]
            });

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `Musical_Theory_Reference_Guide.docx`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating theory document:', error);
            alert('Failed to generate document: ' + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    };
}