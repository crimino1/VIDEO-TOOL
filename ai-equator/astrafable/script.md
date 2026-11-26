# GPT-6.2 Astra vs Claude Fable 5.2: the solar system test
One paragraph = one voice request (Lucius, elevenlabs_3OjIrdtfNKDWeBUP0hIC). Budget: 17,000 characters in total.

## p01 hook
I gave the two smartest AI models in the world the exact same job. One prompt, more than six thousand characters long: build a photorealistic, real-time 3D simulation of our solar system, in a single file. Every planet, the rings, the asteroid belt, comets, real orbital physics. Same words, same settings, no help.

## p02 hook2
One of them finished in about twenty-two minutes. The other took around half an hour, and kept checking its own work the whole time. And one of them needed a reminder halfway through. By the end of this video you'll see both simulations, and you'll know which model actually built the better universe.

## p03 fable
In one corner, Claude Fable 5.2 from Anthropic, released on November ninth. It's the public version of Mythos 5.2, the same model with extra safeguards for things like cyber and biology. On Artificial Analysis, the biggest independent leaderboard, it's the smartest model there is right now, with a score of sixty-five.

## p04 astra
In the other corner, GPT 6.2 Astra, OpenAI's new flagship, released just six days ago. It scores sixty-two, second place. OpenAI calls it the best model in the world for scientists, and by OpenAI's own numbers, it beats Fable by five and a half points on Agents' Last Exam, a test of long professional tasks.

## p05 twist
But here's what makes this test interesting. Artificial Analysis also runs a human-graded 3D test, where real people judge interactive 3D experiences. And there, Astra is number one, with thirteen eighteen against twelve seventy-one for Fable. So on paper, a 3D solar system should be Astra's home turf.

## p06 price
They even cost the same per token: eight dollars per million input tokens and forty per million output. Fable actually just got cheaper, down from ten and fifty. So this comes down to one simple question. What do they actually build?

## p07 prompt
Here's the prompt, and I wrote it to be hard. A living sun, with plasma that boils and flares. Mercury out to Neptune, plus Pluto, each with its own look. Saturn's rings, with real shadows. Fifteen thousand asteroids between Mars and Jupiter, each on its own orbit. Comets whose tails always point away from the sun.

## p08 prompt2
Real orbital physics using Kepler's equation, so planets speed up as they swing close to the sun. Two scale modes, a cinematic camera tour, a time slider, keyboard shortcuts. And all of it, in one HTML file.

## p09 setup
Same prompt, word for word, into both. Fable 5.2 runs inside Claude Code, on high effort. Astra runs inside OpenAI's Codex app, also on high.

## p10 honest
One honest note before we start. The Codex run actually began on GPT 6.2 Sol, the cheaper sibling, because I had the wrong model selected. I switched to Astra partway through, and Astra did the final single-file rebuild you're about to see. Keep that in mind.

## p11 codex_build
On the Codex side, the first attempt ignored part of the brief. Instead of one file, it started setting up a whole project, with a build tool and separate files. So I told it again: single HTML file. Astra took it from there, rebuilt everything as one file, and then checked its own screenshots of the result.

## p12 fable_build
Fable works differently. First it writes itself a checklist. Look at the folder. Settle the approach. Write the sky and the sun. Add the planets, moons and rings. Then the belts, comets and orbit lines. Then the interface, the tour and the shortcuts.

## p13 fable_check
And then it does something I really liked. It opens the simulation in a browser by itself, and checks it. It notices the asteroids look too big next to Earth, and shrinks them. It smooths the small rocky moons, and the cracks on Europa. Then it tests realistic scale, clicking, the tour and the time controls, one by one.

## p14 time
Codex finished in twenty-two minutes and twenty-six seconds, including that restart. Fable was still checking its work at twenty-nine and a half minutes. Fun fact: Fable actually writes more than twice as fast as Astra, about a hundred and ten tokens a second. It's slower overall because it simply does more work.

## p15 reveal
So, speed goes to Codex. Now let's see what they made.

## p16 astra_result
This is what Codex and Astra built. It calls it Solar Atlas, and the first thing you notice is the design. A loading screen while the shaders compile, a clean title, a planet bar along the top. Click a planet and you get a proper page. Jupiter: its size, its mass, its distance from the sun, its day and its year, its moons, and a fun fact.

## p17 astra_tour
The sun, burning. Mercury, grey and cratered. Venus. Earth. Mars. Jupiter, with its Great Red Spot. Saturn, with soft rings. Uranus, tipped on its side with faint rings of its own. Neptune, deep blue, with its dark spot. Honestly, it looks like a polished museum app.

## p18 astra_weak
But it has gaps. Click Pluto, and you get a lovely info card, and an empty patch of space where Pluto should be. Pull back to the full system view, and the planets shrink into tiny dots on thin orbit lines. And Codex itself admitted that the sixty frames per second target was never actually checked.

## p19 fable_result
And this is Fable's. It feels like flying through space. Mars, with craters and a white polar cap, an info panel on the side, and the asteroid belt drifting past as real three-dimensional rocks. Jupiter in the background, with its moons.

## p20 fable_tour
The sun up close, with flares rising off it. A comet, with its long blue tail streaming behind it. Earth, with clouds and city lights. Saturn and its rings. Uranus. Neptune, with its dark spot. Pluto, cratered and pale.

## p21 fable_wide
Pull all the way back and you see the whole system at once: every orbit, the asteroid belt, and the Kuiper belt as a faint ring beyond Neptune. It's not a gallery of planets. It's a place.

## p22 fable_sky
And there's a detail I never asked for. Fable set the sky to today's real date. In its notes it points out that Saturn's rings are nearly edge-on to the sun right now, that Halley's comet is near the far end of its orbit with no tail, and that comet Encke is close to the sun, showing both of its tails. That's not decoration. That's the physics actually running.

## p23 fable_weak
It also measured its own speed: every view rendered in under seventeen milliseconds on this laptop's integrated graphics, fast enough for sixty frames per second. It wasn't perfect, though. It skipped two optional extras, Ceres and the tiny ice particles in Saturn's rings, and it told me so. It needs internet the first time it loads, because three dot js comes from a CDN, which the prompt allowed. And it took longer.

## p24 score
So let's score it. Speed: Codex. Interface design: Codex, those Solar Atlas pages are beautiful. Following the brief the first time: Fable. 3D realism, the feeling of actually being out there: Fable, clearly. Physics and accuracy: Fable, right down to today's sky. And honesty: a tie, both told me exactly what they skipped.

## p25 verdict_test
On this test, Fable 5.2 built the better universe. But one test is one test. Remember, Astra is number one on that human-graded 3D benchmark. So let's look at what other people found.

## p26 others
And honestly, their head-to-heads look a lot like mine. In a game test on dev dot to, Astra finished in about four minutes but faked the 3D, while Fable took around ten and built the real thing. In a Blender test, Astra modelled better and cost about a sixth as much. And YouTuber Nate Herk ran twelve tasks: Fable won seven, Astra five, but Astra was cheaper and faster on every single one.

## p27 bench
On Artificial Analysis' own head-to-head, Fable wins the hardest reasoning tests: eighty on Humanity's Last Exam Diamond, against seventy-two for Astra, and a clear lead on a physics research benchmark too. Astra wins on real scientific work in a terminal, seventy-eight against seventy-three, and it tops the Vals Science Index.

## p28 cost
And then there's the cost. At maximum effort, one task costs about four dollars on Astra, and about twenty-six fifty on Fable. Astra finishes in fourteen minutes, Fable in forty-one. Same price per token, but Fable uses far more tokens to get there.

## p29 science
In real science, the picture splits again. One researcher tested how well the models know real protein sequences. Fable predicted the next amino acid fifty-four percent of the time. Astra was close to zero. Protein designer Sergey Ovchinnikov got Fable to predict a protein's fold correctly from a simple prompt. And Anthropic says Fable helped solve two open problems in black-hole physics, though those papers aren't peer reviewed yet.

## p30 builds
And people are building wild things with both. With Fable: a Mars rover suspension simulation, a webcam X-ray mirror that shows your skull and muscles, a live weather globe. With Astra: Ethan Mollick's space elevator ride in Blender and Unity, and OpenAI's own demo, where Astra writes a car's physics solver and animates it in Blender.

## p31 pattern
So the pattern is clear. Fable is the deeper, more careful builder. It reads the whole brief, checks its own work, and gets the details right. Astra is the faster, cheaper one, with a great eye for design, and it gets surprisingly close.

## p32 use
So which one should you use? If you want something polished, fast and cheap per task, Astra. If you want a model that follows a long, detailed brief, checks its own work, and gets the physics right, Fable. The gap at the top is small, and it moves every few weeks.

## p33 cta
Which one would you trust with your next project? Tell me in the comments, and tell me what I should make them build next. This has been AI Equator.
