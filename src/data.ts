/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleDraft {
  id: string;
  name: string;
  category: string;
  description: string;
  text: string;
}

export const SAMPLE_DRAFTS: SampleDraft[] = [
  {
    id: 'messy-chat',
    name: 'Overlapping Zoom Call Transcript',
    category: 'Dialogue Transcript',
    description: 'Messy online call recording showing unformatted and overlapping speech.',
    text: `[10:02 AM] Hannah: Honestly, I think the server is completely Fried.
[10:02 AM] Marcus: No wait, did you try resetting the router? The yellow box on the wall?
[10:03 AM] Hannah: Yes! I did that three times, Marcus! There's literally smoke coming from the power block.
[10:03 AM] Marcus: Oh. Smoke? That's... not good. Did you use the black heavy-duty cable or... other one?
[10:03 AM] Hannah: The one that was in the cabinet labeled 24V. Why, was that wrong?
[10:04 AM] Marcus: (laughs nervously) Yeah, that port takes 12V max. Hannah, you literally microwaved the router.
[10:04 AM] Hannah: Oh my god, you should have labeled it better! What do we do now? The presentation starts in ten minutes!`
  },
  {
    id: 'rough-notes',
    name: 'Action Pitch & Rough Scene Notes',
    category: 'Rough Draft',
    description: 'Informal prose notes and dialog snippets for a sci-fi encounter.',
    text: `Scene starts in a tense spaceship bridge holding pattern. Lots of alarms blaring, red lights sweeping.
Captain Reyes is frantically punching keys on an unresponsive console. Sub-lieutenant Vance stands behind him holding an old-fashioned fire extinguisher looking terrified.
Reyes yells about steering thrusters being jammed. He says "If we hit that orbital ridge, we are toasted space dust!"
Vance checks his screen. It flickers. He says very quietly "Sir... the ridge isn't a mountain. It's moving."
Reyes stops. Alarms seem to fade out. He looks up. "What do you mean, moving?"
A giant metallic leviathan eye opens outside the main viewport.
Vance drops the extinguisher with a metal clang. "I mean it just blinked."`
  },
  {
    id: 'casual-exchange',
    name: 'Raw Couple Dialogue Walkthrough',
    category: 'Casual Script Notes',
    description: 'A simple outline of dialogue with zero context, slugs, or actions.',
    text: `Sarah: We need to talk.
Mark: Is it about the dishwasher? I swore I'd fix it tonight.
Sarah: No Mark. It's not about the dishwasher. I'm leaving.
Mark: ...Wait. What? Leaving? For where?
Sarah: Chicago. I got the curator job at the modern art institute. I leave on Monday.
Mark: Monday? That's three days from now! You didn't even tell me you applied!
Sarah: I didn't think I'd get it. And frankly, with how things have been... I didn't think it'd matter to you.
Mark: Of course it matters! Sarah, I literally bought a ring yesterday.`
  }
];

export const INITIAL_SCRIPT = {
  title: "TERROR IN SECTOR 9",
  author: "J.R. McArthur",
  elements: [
    {
      id: "init-1",
      type: "Scene Heading" as const,
      text: "INT. SPACE STATION BRIG - NIGHT"
    },
    {
      id: "init-2",
      type: "Action" as const,
      text: "Sparking wires hang from a cracked titanium ceiling. Smoke crawls along the metal floor panels. A RED KLAXON spins lazily, washing the dark room in blood-colored light."
    },
    {
      id: "init-3",
      type: "Character" as const,
      text: "REYES"
    },
    {
      id: "init-4",
      type: "Dialogue" as const,
      text: "We have exactly forty seconds before decompression. Are those escape pods ready?"
    },
    {
      id: "init-5",
      type: "Character" as const,
      text: "VANCE"
    },
    {
      id: "init-6",
      type: "Parenthetical" as const,
      text: "(coughing from the smoke)"
    },
    {
      id: "init-7",
      type: "Dialogue" as const,
      text: "The blast doors are locked from the bridge. I can't override the terminal from down here!"
    },
    {
      id: "init-8",
      type: "Action" as const,
      text: "Reyes grabs a heavy laser welder from the tool rack, igniting its cobalt-blue beam with a hiss."
    },
    {
      id: "init-9",
      type: "Character" as const,
      text: "REYES"
    },
    {
      id: "init-10",
      type: "Dialogue" as const,
      text: "Then we do this the old-fashioned way. Shield your eyes."
    },
    {
      id: "init-11",
      type: "Transition" as const,
      text: "CUT TO:"
    }
  ]
};
