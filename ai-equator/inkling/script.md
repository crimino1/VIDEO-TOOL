# Inkling 2 Mini review (AI Equator, voice: Lucius, eleven_multilingual_v2, no tags, budget 15,000)

## p01 hook
Thinking Machines just dropped Inkling 2 Mini, and this one is a little different. It's an open weights model you can actually run on a laptop, and on coding agent benchmarks, it beats every open model under a hundred billion parameters. That's their claim, at least. So in this video, I'm going to go through what it is, how this weird looping trick works, what people got when they actually ran it, how many tokens per second you get on a Mac mini, a MacBook and a gaming GPU, and how it stacks up against Qwen, Gemma and the rest. And at the end, I'll tell you who should actually use it, and who really shouldn't.

## p02 company
Quick bit of background. Thinking Machines is Mira Murati's company. She was the CTO at OpenAI, and she started this lab in February last year. They raised two billion dollars at a twelve billion dollar valuation before shipping a single model. Then this year, they released Inkling in July, which was huge, almost a trillion parameters. Inkling 2 Small came out earlier this month, at 594 billion. And now there's Mini, which is the one most of us can actually run.

## p03 specs
So, the specs. It's 26.4 billion parameters in total, but it's a mixture of experts, so only about 3.4 billion are active for each token. Every token gets sent to 8 out of 128 experts. It takes text and images, it has a one million token context window, and it's Apache 2.0, so you can use it commercially, fine tune it and ship it, as long as you follow their usage policy. The official download is about 20 gigs, and Thinking Machines says you want at least 32 gigs of memory to run it properly.

## p04 loop
Now, the interesting part is the loop. A normal model has a stack of layers, and every token goes through each layer once. Inkling 2 Mini has 24 layers, split into four blocks of six. The first block runs once, and the last block runs once. But the middle 12 layers run three times for every single token. So you get 48 layer passes out of only 24 layers that are actually stored. Basically, it thinks harder per token, without getting any bigger on your disk. If you watched my GLM 5.4 video, Zhipu did something similar, but they loop twice. Thinking Machines loops three times.

## p05 evidence
And they actually tested where the loop should go. Looping the middle layers beat looping the last layers on 27 out of 28 evaluations. They also say a normal model without the loop would need about 140 percent more compute to match it on long agent tasks. But there's a catch, and they're upfront about it. Looping makes it better at reasoning, but it doesn't help it remember more facts. Knowledge still comes down to total size. So on factual questions, it's about as good as any other 26B model. Keep that in mind, because it comes back later.

## p06 training
One more thing I really like here. They trained it natively in 4-bit, in a format called NVFP4. So the 4-bit version isn't a squished copy of a bigger model. It is the model. You don't lose any quality to quantization. They also started with 384 experts and cut two thirds of them halfway through training, which is a big part of why it ended up this small.

## p07 demos
Okay, benchmarks are kind of boring, so let's look at what it actually builds first. Now, quick confession. My editing laptop only has 16 gigs of RAM. The only thing that would fit is a heavily cut down 2-bit build, and that wouldn't be a fair test. So for this video, I went through Thinking Machines' own demos, plus a bunch of real tests people posted over the last few days, and I'll tell you what I think of each one.

## p08 flight
First, their own demo. One of their researchers took Inkling 2 Mini on a flight, on a MacBook Pro in airplane mode, and got it to build a flight simulator in a few minutes. And honestly, it's pretty fun. You've got terrain, a plane you can actually fly, and a little heads up display. Is it a triple A game? No. But this is a 20 gig model, running offline, at thirty thousand feet.

## p09 town
Then there's Thinkyville. It's a tiny pixel town that Inkling 2 Mini built, and all 20 villagers in it are run by the same model, at the same time, on one offline MacBook. They walk around, talk to each other, and go about their day. I think this is the best demo of the lot, because running lots of agents at once is exactly where a small, fast model makes sense.

## p10 ollama
Ollama posted this one on launch day. It's the model playing 2048 live, one move at a time, straight from the terminal. It's a simple test, but it shows the speed. It's making decisions pretty much in real time.

## p11 island
This next one is from a tester on X, who ran the 4-bit version on an RTX 3090. One prompt: build a snowy floating island in 3D. It used about 23 thousand tokens, and it came out really clean in one shot. For a model this size, that's pretty impressive.

## p12 harness
A few YouTubers put it through proper tests too. Square PC ran it on an RTX 5090 and asked for a 3D pagoda inside an agent harness, where it can take screenshots and fix its own work. And it came out genuinely nice. Night sky, flapping banners, little butterflies. But when he asked for the same kind of thing in one shot, with no harness, the result was honestly pretty rough. Same with a camel riding a bike. The first try had a broken bike, and it took a few rounds of looking at its own renders to fix it. So this model really likes a harness.

## p13 blind
Then Otis's AI Lab ran a blind test against Qwen 3.8 Flash Next. A pixel fishing game, a stand up comedy set, and a 3D breakfast roller coaster, which is exactly as weird as it sounds. He didn't know which was which. When he revealed the results, Inkling had won the fishing game and the comedy round, and he said he was genuinely surprised. But Qwen clearly won the 3D coasters. So for 3D work, he'd still pick Qwen.

## p14 vision
For the vision side, AI with Rithesh ran a 3-bit version on a 24 gig MacBook Air with no fan. It fixed a broken Python repo, seven out of seven tests, in about a minute and a half. It pulled all 17 fields from an invoice into JSON without a single mistake. And it got six out of six screen clicks right. That's the agent stuff it was built for. But when he asked a plain fact with no search, it got the date completely wrong. With search turned on, it got it in a few seconds.

## p15 fails
And it's not all good. When he asked it for a flight sim like the official one, it thought for over twenty thousand tokens, about half an hour, and never wrote a single line of code. Running just four agents at once, each one dropped below four tokens a second. Thinking Machines even admits this in the model card. It can get stuck in long reasoning loops, especially when it's debugging. And it can take destructive actions without asking, and then misreport what it did. So please, run it in a sandbox.

## p16 loopcount
He also tried something really interesting. The number of loops is just a setting in a config file, so he changed it. With one pass, it ran almost twice as fast, but it was useless. It misread a simple math question, and its reasoning slowly turned into random letters. Two passes, it got stuck typing the same number over and over. Three passes, the way it ships, got all four questions right. And four passes? You'd think more thinking helps, but it kept second guessing its own math and got zero out of four. So the loop count isn't a dial you can turn. It was trained for exactly three.

## p17 speed
All right, the question everyone asks. How fast is it on my machine? Thinking Machines doesn't publish a tokens per second number for local hardware, so here's what people actually measured.

## p18 mac
On a Mac mini with the M5 Pro chip and 64 gigs, someone ran a proper benchmark. About 30 tokens per second with a short prompt, 25 at 32 thousand tokens of context, and 17 at 131 thousand. On a MacBook Pro with the M4 Pro and 36 gigs, through Ollama, it's about 27 tokens per second, using 21 gigs of memory. And on a Mac Studio with the M5 Ultra, it goes up to about 83 tokens per second.

## p19 gpu
On Nvidia, an RTX 4090 gets around 57 to 60 tokens per second. A single RTX 3090 with the 4-bit version gets about 73, and two of them get close to 90. A DGX Spark sits around 45. Even an 8 gig RTX 4060 can run it, at about 18 tokens per second, with a 3-bit build. And Square PC hit over 400 tokens per second for short bursts on an RTX 5090, with an optimized engine, though most of the time it hovered around 250.

## p20 claims
Now, you'll see some huge numbers on X. Exo Labs claimed 210 tokens per second on an M5 Ultra. But they're a launch partner, they didn't share their settings, and the best independent number on that same chip is about 83. On Thinking Machines' own servers, Artificial Analysis measured 197 tokens per second. So that's the cloud number, not your laptop.

## p21 prefill
The real weak spot is prefill. That's how fast it reads your prompt before it starts answering. On that Mac mini, it reads about 490 tokens per second with a short prompt, but only about 95 at 131 thousand. One person fed it 950 thousand tokens on a DGX Spark, and it took 26 and a half minutes before the first word came out. And a tester on an RTX 3060 said the prefill was the slowest he'd ever posted. So yes, it has a million token context, but actually filling it is painful.

## p22 memory
Memory matters too. The community 4-bit builds on Hugging Face are about 17 to 18 gigs, the 3-bit ones are 13 to 15, and there's even a 2-bit version around 10 gigs that fits on a 16 gig machine. But long context eats memory fast. One tester found that at 131 thousand tokens, it used 31 gigs, where Qwen 3.8 27B used 21. And at 262 thousand tokens, it didn't fit at all.

## p23 bench
Okay, now the benchmarks, and how it compares with other open models in this size range. Thinking Machines put it up against Qwen 3.8 27B, Google's Gemma 4 31B, Meta's Muse Glimmer, and Nvidia's Nemotron 3.5 Super. On the Artificial Analysis Intelligence Index, Inkling 2 Mini scores 20.1, which is exactly tied with Qwen 3.8 27B. Gemma 4 31B gets 4.4, Muse Glimmer 6.3, and Nemotron 13.6.

## p24 coding
Where it really pulls ahead is coding agents. On SWE-bench Verified, which is fixing real GitHub issues, it scores 79.2 percent, against Qwen's 77.8 and Gemma's 46.1. On DeepSWE, another coding agent test, it's 48.2 against Qwen's 42.2, while Gemma gets basically zero. And on BrowseComp, which tests how well it can dig through the web to find an answer, it's 79 percent, against Qwen's 61.6. That's a big gap.

## p25 losses
But it doesn't win everything, even in their own table. Qwen beats it on Terminal Bench 2.1, on GDPval, which is real office work, on AutomationBench, and on MMMU Pro, which is vision reasoning. And on factual accuracy, Qwen is clearly better. Inkling avoids hallucinating 63.4 percent of the time. Qwen, 71.4. That's the knowledge problem I mentioned earlier.

## p26 aa
Artificial Analysis ranks it number two out of 16 models in its size class, just behind Nanbeige 4.3 33B. But look at the cost. One of their index tasks cost 59 cents with Inkling, against three dollars 53 for Qwen 3.8 27B. That's about six times cheaper. And it finished tasks in about half the time, even though it used around 38 percent more output tokens.

## p27 vals
One thing to be careful with, though. Thinking Machines says it scores 46.5 percent on the Vals Index. But Vals' own page currently shows 44 percent, ranked 38 out of 43. So it's good for its size, but it's not a top model overall.

## p28 others
And if you're wondering about DeepSeek, they don't have anything in this size range. Their smallest model, V4.1 Flash, is 552 billion parameters. OpenAI's gpt-oss 20B is still around, but Artificial Analysis doesn't even list a current index score for it. So in the 20 to 35 billion range right now, it's basically Inkling, Qwen, and Nanbeige at the top.

## p29 frontier
Just for perspective, the best closed model right now, Claude Fable 5.2, scores 65 on that same index. The best open model overall, Kimi K3.1 Pro, scores 46. So Inkling 2 Mini, at 20, isn't competing with those. It's competing with whatever fits on your desk.

## p30 who
So, who should use it? If you care about privacy, and you want your code or your documents to never leave your machine, this is one of the best options right now. If you work offline, on flights, or anywhere with bad internet, same thing. If you're building coding agents or search agents on a budget, it's really cheap to run. And because it's Apache 2.0, you can fine tune it and ship it in your own product.

## p31 whonot
And who shouldn't? If you mostly ask it factual questions, it'll make things up more than Qwen, so pair it with search. If you work in languages other than English, Thinking Machines says it's weaker there. If you've got a 16 gig machine, you're stuck with the 2 or 3-bit versions, and those are slow. If you need long multi-turn chats or really hard engineering work, it struggles. It scored 5.6 percent on Terminal Bench 4, the same as Qwen, so neither of them is good there. And it's still early. Some runtimes need patches, and one tester couldn't get it running at all on an RTX 6000 Ada.

## p32 wrap
So that's Inkling 2 Mini. Honestly, I think the loop is a really smart idea. It's tied with Qwen on intelligence, better at coding agents, a lot cheaper, and it fits on a 32 gig Mac. But it's slow at reading long prompts, weaker on facts, and still a bit rough around the edges. Let me know in the comments if you've tried it, and what speed you're getting on your machine. If you enjoyed this, hit like and subscribe, and I'll see you in the next one.
