# The Lost Expedition — Expanded Journey Remake

A browser-based cooperative fantasy RPG for 1–6 players. This remake keeps the established dice, skills, Growth, Hope, Threat, save/return and class systems, but substantially changes the pace and structure of the campaign.

## What is new in this remake

- **Real route branches.** Several major choices now open 5–6 exclusive scenes before reconverging with the main story. The East River Road and Western Ridge, Moon Marsh and Old King’s Ridge, Sea Cliffs and Old Quarry, and High Pass and Deep Rootway are genuinely different journeys.
- **Split parties.** At selected moments the company can divide into two groups. Each group receives its own scenes, challenges and turn opportunities while the global player order continues. When both groups reach the rendezvous, the engine reunites them automatically.
- **Fog-of-war map.** The Journey panel is now a stylised map of Aranor. Explored regions emerge from the fog, dotted routes record where the company has travelled, and separated groups leave different trails.
- **Sense Checks.** Optional low-stakes checks use relevant skills to notice shortcuts, clues, safe routes, supplies or context. Missing a Sense Check does not add Threat, wound a hero or give Growth.
- **Longer travel.** Forests, marshes, ridge roads, cliffs and mountain routes now take several scenes. Travel can include camps, weather, route finding, observations and quiet choices rather than jumping directly between plot anchors.
- **Multi-stage battles.** The White City siege now unfolds across several beats. The company can even split between the western wall and the burning lower ward before reuniting for the final approach.
- **Party-size scaling.** Team challenges adapt to the number of heroes actually present in the current subgroup.
- **Shared consequences, separate experiences.** Hope, Threat, Supplies and special items remain expedition-wide, but split groups can discover different information and take different paths.

## Core rules retained

- Six classes: Knight, Ranger, Thief, Mage, Monk and Engineer
- Ten skills and 20 starting skill points
- Relevant skills are restricted by the challenge
- D6 checks with Advantage/Disadvantage at higher mastery or serious wounds
- Heroic Moments on a 6 and Unexpected Complications on a 1
- Solo, Support and Team challenges
- 5 Growth = 1 Skill Point
- Heroic Intervention
- Hope and Threat
- Save, reconnect, Return PIN and campaign backup
- Multiple endings based on discoveries, allies and choices

## Scale

The campaign now contains roughly **120 scene definitions**. A single group will not see all of them: route choices and split-party sections deliberately create different versions of the journey.

- **Cinematic landing page.** The opening screen now uses a new full-height Aranor illustration and a simpler adventure-first presentation.
- **Cleaner Sense Checks.** Sense Checks now focus on the target, relevant skill ratings, and what success or a miss means, without repeating general rules.

## Run / deploy

Use the same Node / Express / Socket.IO deployment process as earlier versions. Upload the project contents to the existing GitHub repository and redeploy on Render, or run locally with `npm install` and `npm start`.

## Voice chat & ambient audio update

This build adds optional in-browser voice chat using WebRTC, with Socket.IO used only for signalling. Players can join/leave voice independently of game state, mute themselves, and see speaking indicators. Voice requires HTTPS and browser microphone permission. The default configuration uses public STUN servers; for the most reliable production use across restrictive networks, add a TURN service in a future deployment.

The Lost Expedition also now has procedural ambient soundscapes that change with the story location: sea, storm, shoreline waves, river, marsh, forest, caves, mountain wind and battle atmosphere. Ambience has its own toggle and does not affect voice chat.

## Dialogue & Memory Pass
This build adds consequential NPC dialogue, hidden relationship state, a People/Clues/Decisions journal, combined clue conclusions, and knowledge-based difficulty adjustments. Successful questioning now produces actual answers; failed conversations can still reveal partial information or alter trust.
