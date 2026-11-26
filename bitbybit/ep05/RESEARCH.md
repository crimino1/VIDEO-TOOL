# EP05 research: "how your feed knows you"

Facts below were checked against primary sources (papers, Netflix's own contest pages, the WSJ video) unless marked (Wikipedia) or (not checked). Downloaded sources are in `research_src/` (PDFs, text extracts, the WSJ subtitle transcript `wsj_tiktok_transcript.txt`, and raw page captures `web_*.png`).

---

## 1. Northeastern phone-listening study (narration 0:11-0:38)

**Paper:** Elleen Pan, Jingjing Ren, Martina Lindorfer, Christo Wilson, David Choffnes. "Panoptispy: Characterizing Audio and Video Exfiltration from Android Applications." *Proceedings on Privacy Enhancing Technologies* (PoPETs) 2018, issue 4, pp. 33-50. DOI 10.1515/popets-2018-0030. Licence: CC BY-NC-ND 3.0.
- Affiliations: Pan, Ren, Wilson, Choffnes = Northeastern University. Lindorfer = UC Santa Barbara.
- URLs: https://petsymposium.org/popets/2018/popets-2018-0030.php, PDF https://petsymposium.org/popets/2018/popets-2018-0030.pdf
- Press coverage that made it famous: Kashmir Hill, Gizmodo, July 2018, "These Academics Spent the Last Year Testing Whether Your Phone Is Secretly Listening to You": https://gizmodo.com/these-academics-spent-the-last-year-testing-whether-your-phone-is-secretly-listening-to-you-1826961188

**Verified facts**
- **17,260 apps** from Google Play, AppChina, Mi.com and Anzhi (so not only Google Play; 3 of the 4 stores are Chinese).
- Every app was checked with static analysis. Only **9,100 apps (53%)** were actually run on real phones (Nexus 5/5X/6P), driven by an automated tapper (Monkey), with all traffic recorded.
- Audio result (p. 40): "We did not find any true positive audio files in our extracted dataset, i.e., no apps appeared to exfiltrate audio in our tests." Screenshot: `assets/img/ss_panoptispy_no_audio_found.png`.
- What they did find: 21 cases of media in traffic, 12 counted as leaks. Third-party libraries recorded **screenshots and screen videos** of app use and uploaded them without any permission or notice. Best-known case: the GoPuff food-delivery app sent a screen recording to the analytics firm Appsee (`com.main.gopuff` -> appsee.com, mp4, "screenshot video of app usage"). Photo-editing apps also uploaded users' photos to servers without saying so.
- Caveats in the paper's own Limitations section: the analysis "could also indicate that our analysis missed other cases". An app could turn audio into a **text transcript** before sending it, and that would not be detected. Automated tapping is not a human user. The study was Android only.

**Narration check**
- "more than 17,000 Android apps, the popular ones included" -- OK (17,260).
- "and watched everything those apps sent out" -- **NUANCE:** traffic was recorded for 9,100 of them, not all 17,260. Safer wording: "watched the traffic of over 9,000 of them".
- "Not one of them switched on the microphone in secret. Not one sent out audio." -- The paper measured audio *sent out*, not the mic switching on. "Not one sent out audio" is exact. "Switched on the microphone" is Gizmodo's paraphrase ("no evidence of an app unexpectedly activating the microphone"). Acceptable, but "sent out" is the stricter claim.
- "They were careful to say, that doesn't prove it never happens" -- OK (Limitations section).
- Optional twist worth a line: what they did find was apps secretly *recording the screen*.

## 2. Netflix Prize (narration 2:13-3:09)

**Primary sources**
- Netflix Prize rules, archived Oct 2006: https://web.archive.org/web/20061016/http://www.netflixprize.com/rules -- "Contest begins October 2, 2006". Training set is "more than 100 million ratings from over 480 thousand randomly-chosen, anonymous customers on nearly 18 thousand movie titles", collected Oct 1998 to Dec 2005. The bar is "10% better than what Cinematch can do".
- Final leaderboard, archived 26 Sep 2009: https://web.archive.org/web/20090926213457/http://www.netflixprize.com:80/leaderboard
- Netflix's winner announcement post (prizemaster, 2009-09-18): https://web.archive.org/web/20091005061113/http://www.netflixprize.com:80/community/viewtopic.php?id=1537
- Wikipedia summary with exact counts: https://en.wikipedia.org/wiki/Netflix_Prize

**Verified facts**
- Exact dataset: **100,480,507 ratings, 480,189 users, 17,770 movies** (Wikipedia; Netflix's rules round these to >100M / >480K / nearly 18K).
- Sparsity: 100,480,507 / (480,189 x 17,770) = 1.18% filled, so **98.8% blank**. "around 99%" is correct.
- Prize: $1,000,000 for a 10% better RMSE than Cinematch (Cinematch test RMSE 0.9525; target 0.8572). Progress prizes were $50,000 a year.
- Progress: 2007 Progress Prize went to KorBell/BellKor (Koren, Bell, Volinsky, AT&T Labs) at **8.43%**. The 2008 prize went to "BellKor in BigChaos" (merged with Töscher and Jahrer of Commendo) at **9.46%** (Koren et al. 2009 give 8.43 and 9.46). In 2009 they merged again with Pragmatic Theory (Piotte, Chabbert) to form **BellKor's Pragmatic Chaos**, which passed 10% on June 26, 2009 (10.05% quiz score). That triggered the jury's last call, giving teams 30 days (Wikipedia).
- The rival super-team: **The Ensemble**, formed by merging "Grand Prize Team" and "Opera Solutions and Vandelay United" (Wikipedia; the final leaderboard still lists those teams separately).
- Final leaderboard (test score): BellKor's Pragmatic Chaos **0.8567, 10.06%, submitted 2009-07-26 18:18:28**. The Ensemble **0.8567, 10.06%, submitted 2009-07-26 18:38:22**. The scores are **identical** to 4 decimals, and the gap is **19 min 54 s**, so "about 20 minutes earlier" is exact. (On the public quiz set The Ensemble was slightly ahead, 10.10% vs 10.09%.)
- Netflix's post also says the winning entry came "just 24 minutes before the conclusion of the nearly three-year-long contest". That is a different figure: time before the deadline, not the gap to the runner-up. Don't mix them up.
- Winners, as spelled by Netflix: **Bob Bell, Martin Chabbert, Michael Jahrer, Yehuda Koren, Martin Piotte, Andreas Töscher, Chris Volinsky.** Affiliations: Bell and Volinsky, AT&T Labs; Koren, Yahoo! Research; Töscher and Jahrer, Commendo Research & Consulting (Austria, per Wikipedia); Piotte and Chabbert, Pragmatic Theory.
- Announced Sept 18, 2009. **Awarded at a ceremony in New York City on Sept 21, 2009** (the check is dated 09.21.09 and signed by Reed Hastings).
- Scale: final leaderboard footer says "51051 contestants on 41305 teams from 186 different countries", with "44014 valid submissions from 5169 different teams".
- Footnote (optional): the sequel was cancelled on March 12, 2010 after a privacy lawsuit and FTC concerns. Narayanan and Shmatikov had re-identified users by matching against IMDb.

**Narration check**
- "100 million movie ratings from 480,000 customers across about 18,000 movies" -- OK (Netflix's own wording).
- "around 99% of the boxes are blank" -- OK (98.8%).
- "Beat our own system by 10%" -- OK.
- "It took almost three years" -- OK (Oct 2, 2006 to July 26, 2009; awarded Sept 21, 2009). Netflix says "nearly three-year-long contest".
- "Thousands of teams" -- OK and conservative (41,305 registered, 5,169 submitted).
- "The leaders got stuck around 8%, so rival teams started merging" -- **NUANCE:** progress slowed after 8.43% (2007), and merging made the 2008 jump to 9.46%. "Stuck around 8 to 9 percent" is more accurate. The merges themselves are correct.
- "two super teams posted nearly identical scores" -- the test scores were **exactly** identical (0.8567). You could say "the same score".
- "submitted about 20 minutes earlier" -- OK (19:54).

## 3. Matrix factorization and latent factors (narration 3:14-4:24)

**Sources**
- Yehuda Koren (Yahoo Research), Robert Bell and Chris Volinsky (AT&T Labs--Research). "Matrix Factorization Techniques for Recommender Systems." *IEEE Computer*, August 2009, pp. 42-49 (cover feature). PDF copy used: https://datajobs.com/data-science-repo/Recommender-Systems-%5BNetflix%5D.pdf
- Simon Funk, "Netflix Update: Try This at Home", Dec 11, 2006: https://sifter.org/~simon/journal/20061211.html -- popularized learning the factors by stochastic gradient descent (the "nudge every number a little" step). He suggests e.g. 40 aspects and uses "action" vs "chickflick" as example labels.

**What the paper actually says**
- Factors: "say, 20 to 100 factors inferred from the ratings patterns." So "50 numbers" is a fair example.
- Speculative examples in the text: "the discovered factors **might** measure obvious dimensions such as comedy versus drama, amount of action, or orientation to children; less well-defined dimensions such as depth of character development or quirkiness; or completely uninterpretable dimensions."
- Figure 2 (`ss_koren_fig2_hypothetical_axes.png`) is explicitly **hypothetical**: "two hypothetical dimensions characterized as female- versus male-oriented and serious versus escapist."
- Figure 3 (`ss_koren_fig3_netflix_factors.png`) shows the **real** first two factors from the Netflix data. Factor 1: "lowbrow comedies and horror movies, aimed at a male or adolescent audience (Half Baked, Freddy vs. Jason)" vs "drama or comedy with serious undertones and strong female leads (Sophie's Choice, Moonstruck)". Factor 2: "independent, critically acclaimed, quirky films (Punch-Drunk Love, I Heart Huckabees)" vs "mainstream formulaic films (Armageddon, Runaway Bride)."
- Prediction is the dot product of the user and item vectors (multiply pair by pair, add up). That matches the narration exactly.

**Narration check**
- "When researchers looked at what those numbers had turned into, they meant something" -- OK (Figure 3: "Someone familiar with the movies shown can see clear meaning in the latent factors").
- "serious versus silly" -- **fair** paraphrase of the real factor 1 (lowbrow comedy/horror vs serious-undertone drama), and of the hypothetical "serious vs escapist".
- "made for kids versus made for adults" -- **only a "might measure" example** ("orientation to children"), not a factor they showed. The closest real finding is factor 1's "male or adolescent audience" end.
- "big explosions versus long conversations" -- **a paraphrase of "amount of action"**, again a "might" example. The real factor 2 is quirky-indie vs mainstream-formulaic (Armageddon sits at the "mainstream" end).
- Safer options: use the two real axes (lowbrow vs serious; quirky indie vs mainstream blockbuster), or soften to "one turned out to be roughly serious versus silly; others looked like things such as how much action, or who it's made for".
- "the idea that carried that whole contest" -- **NUANCE:** Koren et al. say their winning entries blended "more than 100 different predictor sets, the majority of which are factorization models". So factorization was the core, but the win came from blending many models.
- "Billions of times" -- not stated in the sources. With about 100M ratings x many passes it is plausible, but treat it as rhetoric.

## 4. WSJ TikTok bot investigation (narration 4:54-5:23 and 7:38-7:54)

**Primary source:** WSJ video, YouTube title "How TikTok's Algorithm Figures You Out | WSJ" (verified via yt-dlp), uploaded July 21, 2021. On wsj.com the URL slug reads "investigation-how-tiktok-algorithm-figures-out-your-deepest-desires" and it belongs to the "Inside TikTok's Highly Secretive Algorithm" series (per Tubefilter). The title in the brief, "Inside TikTok's Algorithm: A WSJ Video Investigation", was not confirmed or refuted, so use the YouTube title on screen. https://www.youtube.com/watch?v=nfczi2cI6Cs . Transcript from the auto-subs: `research_src/wsj_tiktok_transcript.txt`. Secondary: Tubefilter, 21 July 2021 https://tubefilter.com/2021/07/21/tiktok-recommendation-algorithm-wall-street-journal-guillaume-chaslot/

**Verified facts (timestamps are in the WSJ video)**
- 0:45 "the Wall Street Journal created **over a hundred automated TikTok accounts** or bots that watched hundreds of thousands of videos".
- 1:06 TikTok "only needs one of these to figure you out: how long you linger over a piece of content. Every second you hesitate or re-watch, the app is tracking you".
- 2:40 Each bot got a date of birth and an IP address (location), with no gender. "We gave each bot or user interests but those interests were **never entered into the app**. The only way our users expressed their interests was by **re-watching or pausing** on videos with related hashtags or images." Example interests shown: extreme sports, forestry, dance, astrology, animals (Tubefilter says "pets"). The on-screen bot cards include @kentucky_96 (tags: Depression, Sadness; age 24) and @virginia_13 (tags: Forestry, Yoga; age 13).
- 4:07 "TikTok fully learned many of our accounts' interests in **less than two hours**, some it figured out in **less than 40 minutes**."
- 4:15 Guillaume Chaslot (ex-YouTube engineer): "on YouTube more than 70% of the views come from the recommendation engine". Useful corroboration for story 5.
- Sad bot **kentucky_96**: pauses on a sad video at its 15th video, under 3 minutes in. 8:41 "after **224 videos** into the bot's overall journey, or **about 36 minutes** of total watch time, TikTok's understanding of kentucky_96 takes shape: videos about depression and mental health struggles outnumber those about relationships and breakups." Then "**93%** of videos shown to the account are about sadness or depression" (graphic shows 93%, 278 videos). TikTok's spokeswoman said some of the remaining 7% are meant to help users discover different content.
- TikTok told WSJ that bot behaviour isn't representative of real users.

**Narration check**
- "more than 100 fake accounts, bots, and gave each one a secret interest" -- OK.
- "Dogs. Dancing. Astrology." -- dance and astrology are WSJ's examples. "Dogs" is close to "animals/pets"; "extreme sports" or "forestry" are verbatim alternatives.
- "never searched for anything and never typed a word ... only pause a little longer" -- OK. WSJ says interests were never entered and were expressed only by re-watching or pausing. (Rewatching counts too; the narration mentions only pausing.)
- "most of them figured out in under two hours, some in under 40 minutes" -- WSJ says "many", not "most". Minor; "many" is exact.
- "one bot was set to linger on sad videos. After about 36 minutes of watching, its feed had filled up with them" -- **NUANCE:** at 36 minutes depression content *began to outnumber* relationship content. The flood (93%) came after that. Tubefilter says 33 minutes; WSJ's own figure is 36. Fine as narrated; for precision say "after about 36 minutes, the sad videos took over".

## 5. YouTube's two-stage recommender and the 70% claim (narration 5:38-6:22)

**Paper:** Paul Covington, Jay Adams, Emre Sargin (Google, Mountain View). "Deep Neural Networks for YouTube Recommendations." *Proceedings of the 10th ACM Conference on Recommender Systems* (RecSys '16), 2016. https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/ , PDF https://static.googleusercontent.com/media/research.google.com/en//pubs/archive/45530.pdf
- Abstract: "two-stage information retrieval dichotomy: first, we detail a deep candidate generation model and then describe a separate deep ranking model."
- Figure 2 (`ss_youtube_paper_fig2_funnel.png`): video corpus (**millions**) -> candidate generation -> (**hundreds**) -> ranking -> (**dozens**). Candidate generation "retrieves a small subset (hundreds) of videos". At serving time "an approximate nearest neighbor lookup is performed to generate hundreds of candidate video" items, so "near you in that space" is literally right (embeddings).
- Ranking objective (Sec. 4): "generally a simple function of expected watch time per impression. Ranking by click-through rate often promotes deceptive videos that the user does not complete ("clickbait") whereas watch time better captures engagement." They modify logistic regression to predict "expected watch time (rather than click probability)".
- Bonus for story 7: the intro says "Balancing new content with well-established videos can be understood from an exploration/exploitation perspective."

**70% claim**
- Original: Joan E. Solsman, CNET, Jan 10, 2018, "YouTube's AI is the puppet master over most of what you watch": "For **more than 70 percent** of the time you spend watching on Google's massive video site, you're lured in by one of the service's AI-driven recommendations, YouTube Chief Product Officer Neal Mohan said". Archived: https://web.archive.org/web/20180111083854/https://www.cnet.com/news/youtube-ces-2018-neal-mohan/ . Screenshot `ss_cnet_2018_70_percent.png`.
- WARNING: the CBS News syndicated copy (https://www.cbsnews.com/news/ces-youtubes-ai-is-the-puppetmaster-over-what-you-watch/) still says "more than **75** percent". CNET's own page carries a correction (3:05 pm, same day) stating the true figure is "more than 70 percent". Cite CNET, not CBS.
- Also reported by Quartz (https://qz.com/1178125/youtubes-recommendations-drive-70-of-what-we-watch) and Tubefilter (https://www.tubefilter.com/2018/01/11/youtube-most-watch-time-driven-by-recommendations/). Mohan also said mobile sessions average more than 60 minutes. Mohan was Chief Product Officer then. He is now YouTube CEO (the State Dept photo caption of Sept 2023 calls him that; start date not checked).

**Narration check**
- "its engineers describe them in a paper in 2016" -- OK.
- "grabs a few hundred videos that sit near you" -- OK.
- "predicts one number for each. How long you will watch" -- OK (expected watch time per impression; "generally", and tuned by A/B tests).
- "They tried clicks. And clicks reward clickbait." -- **NUANCE:** the paper doesn't describe an experiment where they tried clicks. It states that ranking by click-through rate promotes clickbait, and that is why they model watch time. Safer: "Ranking by clicks, they wrote, rewards clickbait."
- "YouTube has said about 70% of everything people watch there comes from recommendations" -- OK (Mohan, CES 2018: "more than 70 percent" of watch time). The figure is from 2018.

## 6. Facebook Likes vs. human judges, PNAS 2015 (narration 6:31-7:05)

**Paper:** Wu Youyou (University of Cambridge, Dept. of Psychology), Michal Kosinski (Stanford University, Dept. of Computer Science), David Stillwell (University of Cambridge, Dept. of Psychology). "Computer-based personality judgments are more accurate than those made by humans." *PNAS* 112(4):1036-1040, published online Jan 12, 2015. doi:10.1073/pnas.1418680112. Open copy: https://pmc.ncbi.nlm.nih.gov/articles/PMC4313801/ (pnas.org is behind a Cloudflare check, so the screenshot uses PMC.)
- Name order: Chinese name order is "Wu Youyou" on the paper and PMC (given name Youyou, family name Wu). Kosinski's Polish spelling is Michał Kosiński; the paper uses "Michal Kosinski".

**Verified facts**
- **86,220 volunteers** completed the **100-item** IPIP Big Five questionnaire, via the myPersonality Facebook app (data 2009-2012).
- Computer judgments (LASSO regression on Likes) were made for 70,520 people. 17,622 were also rated by one Facebook friend (10-item questionnaire), and 14,410 by two friends.
- Computer accuracy r = 0.56 at the average 227 Likes. Average human (friend) accuracy in their sample is r = 0.49, which the computer matches at about 100 Likes.
- "Compared with the accuracy of various human judges reported in the **meta-analysis** (20), computer models need **10, 70, 150, and 300 Likes**, respectively, to outperform an average **work colleague, cohabitant or friend, family member, and spouse**." Figure 2 (`ss_pnas_fig2_likes_vs_judges.jpg`): work colleague 0.27, friend/cohabitant 0.45, family 0.50, spouse 0.58.

**Narration check**
- "researchers at Cambridge and Stanford ... 86,000 volunteers" -- OK.
- "Each took a long personality test" -- OK (100 items).
- "using only the pages they had liked on Facebook" -- OK (Facebook Likes; "pages" is a fair simplification).
- 10 / 70 / 150 / 300 -> coworker / friend / family / husband or wife -- numbers OK. **NUANCE:** the coworker, family and spouse benchmarks were *not* the participants' own coworkers and spouses. They are average accuracies taken from an earlier meta-analysis (Connelly & Ones, 2010). Only friends rated participants directly. "Better than a typical coworker/spouse" is accurate; "your husband or wife" implies a head-to-head test that didn't happen. Also, "your personality" means Big Five self-ratings.

## 7. Exploration in recommenders (narration 8:20-8:40)

- Lihong Li, Wei Chu, John Langford, Robert E. Schapire. "A Contextual-Bandit Approach to Personalized News Article Recommendation." WWW 2010 (authors then at Yahoo!; affiliations not re-checked). https://arxiv.org/abs/1003.0146 . This is the standard citation for exploration vs exploitation in live recommenders. The algorithm adapts "its article-selection strategy based on user-click feedback to maximize total user clicks" and reported "a 12.5% click lift compared to a standard context-free bandit algorithm" on the Yahoo! Front Page Today Module.
- Corroboration from the YouTube 2016 paper: freshness and "Balancing new content with well-established videos can be understood from an exploration/exploitation perspective."
- WSJ (story 4): TikTok's spokeswoman said some of the 7% of non-matching videos are there to help users discover different content. That is an explicit platform statement of exploration slots.

**Narration check:** "spending one slot to ask you a question ... Engineers call it exploring" -- fair description of exploration. Caveat: a random-looking video can also be an ad, a trending item or a plain mistake. Not every odd recommendation is exploration.

## Not verified here (outside the 7 stories)
- 8:00-8:18 tips (Not-interested button "strongest vote", clearing/pausing history, search vs drift, "finishing is the loudest signal"). Clearing and pausing history are documented YouTube controls, but the strength rankings weren't checked. "Finishing" fits YouTube's watch-time objective and WSJ's re-watch signal.
- 8:48 "same Wi-Fi" household signal: plausible, but no source checked.

---

## Media gathered

### Photos (assets/img/)
| File | Who/what | Source | Licence / author |
|---|---|---|---|
| cm_reed_hastings_2008.jpg | Reed Hastings, Oct 2008 (Netflix CEO during the Prize) | Commons: File:Reed Hastings 2008 A.jpg | CC BY 2.0, JD Lasica |
| cm_reed_hastings_2010.jpg | Reed Hastings | Commons: File:Reed Hastings 2010 A.jpg | CC BY 2.0, JD Lasica |
| cm_kosinski_2019.jpg | Michał Kosiński (Stanford), Warsaw 2019 | Commons: File:Michał Kosiński 2019.jpg | CC BY-SA 3.0 PL, Adrian Grycuk |
| cm_neal_mohan_2013.jpg | Neal Mohan, TechCrunch Disrupt NY 2013 | Commons: File:TechCrunch Disrupt NY 2013 Day Two ft Neal Mohan (cropped).jpg | CC BY 2.0, TechCrunch (photo Max Morse) |
| cm_neal_mohan_2023.jpg | Neal Mohan, NYC Sept 19, 2023 | Commons: File:Neal Mohan, in New York City on September 19, 2023 - 53199232941 (cropped).jpg | Public domain, U.S. Department of State |
| cm_northeastern_sign_2020.jpg | Northeastern sign, Krentzman Quad / Ell Hall | Commons: File:Northeastern University.jpg | CC BY-SA 4.0, Edward Orde |
| cm_datacenter_racks.jpg | empty server racks (generic) | Commons: File:Datacenter Server Racks (22370909788).jpg | CC BY 2.0, Carl Lender |
| cm_netflix_prize_leaderboard_2009-06-26.jpg | Netflix Prize leaderboard the day BellKor's Pragmatic Chaos hit 10.05% | Commons: File:Netflix prize.jpg | Tagged PD by uploader Ivongala, but it is a screenshot of Netflix's site, so the PD claim is doubtful. Prefer the archive.org screenshots. |
| press_christo_wilson_northeastern.jpg | Christo Wilson | Northeastern Khoury College profile https://www.khoury.northeastern.edu/people/christo-wilson/ | University press photo, (c) Northeastern; editorial use, credit Northeastern |
| press_david_choffnes_northeastern.jpg | David Choffnes | Khoury profile https://www.khoury.northeastern.edu/people/david-choffnes/ | University press photo, (c) Northeastern |
| press_david_stillwell_cambridge_jbs.jpg | David Stillwell (703x396, small) | Cambridge Judge Business School profile https://www.jbs.cam.ac.uk/people/david-stillwell/ | University press photo, (c) Cambridge JBS |

Not found on Commons: Yehuda Koren (File:YehudaKoren.jpg is a different person, an Israeli colonel), Bob Bell, Chris Volinsky, Wu Youyou, Stillwell, Wilson, Choffnes. For Koren, Bell and Volinsky, use frames from the AT&T video below.

### Receipts / screenshots (assets/img/, 1600 px wide)
- ss_panoptispy_pets_page.png -- PoPETs page with title, authors, 17,260-app abstract
- ss_panoptispy_title_abstract.png -- paper page 1 (title, authors, abstract)
- ss_panoptispy_no_audio_found.png -- the "no apps appeared to exfiltrate audio" paragraph
- ss_netflix_prize_leaderboard_full.png / ss_netflix_prize_leaderboard_top2.png -- final leaderboard (0.8567 vs 0.8567; 18:18:28 vs 18:38:22)
- ss_netflix_prize_grand_prize_post.png -- Netflix's announcement naming all 7 winners, the NYC ceremony on Sept 21, 2009, and "24 minutes before the conclusion"
- ss_koren_paper_page1.png -- IEEE Computer title page (Koren / Bell / Volinsky)
- ss_koren_fig2_hypothetical_axes.png -- serious vs escapist / geared toward females vs males (hypothetical)
- ss_koren_fig3_netflix_factors.png -- the real factor map from Netflix data
- ss_youtube_paper_page1.png -- title, authors, abstract
- ss_youtube_paper_fig2_funnel.png -- millions -> hundreds -> dozens funnel
- ss_cnet_2018_70_percent.png -- CNET headline "for 70 percent of the time you watch"
- ss_pnas_pmc_title_authors.png -- PNAS title and authors (PMC)
- ss_pnas_abstract_pmc.png -- full PNAS abstract (86,220 volunteers, r = 0.56 vs 0.49). Captured from PMC; the PDF on pnas.org, PMC and Europe PMC is bot-blocked.
- ss_pnas_fig2_likes_vs_judges.jpg -- the 10/70/150/300 Likes chart (PNAS Fig. 2; 768 px is the largest version PMC serves; (c) PNAS, cite on screen)
- ss_pnas_fig1_method.jpg -- PNAS Fig. 1, users x Likes matrix (a nice tie-in to the spreadsheet idea)

### Video (stock/raw/, all h264 bt709 mp4)
None are CC licensed; all are standard YouTube licence. Use short excerpts with on-screen credit (commentary / fair use), or get permission.

1. **yt_att_netflix_prize.mp4** -- AT&T Tech Channel, "From the Labs: Winning the Netflix Prize" (2010-01-28), https://www.youtube.com/watch?v=ImpV70uLxyw , 8:22, **only 550x310**. AT&T Tech Channel logo at 0:00-0:12 and a "From the Labs" bug in lower thirds.
   - 0:36-1:10 Netflix website (2009); 1:24 Netflix press release "$1,000,000"
   - 1:48-1:56 BellKor team photo on a star, with "KORBELL" / "BELLKOR" text overlay (photo appears clean at about 1:48-1:50)
   - 2:00-2:02 **Chris Volinsky** interview with name lower third ("Director of Statistics Research, AT&T Labs Research")
   - 2:14-2:20 kinetic text "100 MILLION RATINGS / 18 THOUSAND MOVIES / 480 THOUSAND USERS"
   - 2:28-2:36 Bob Bell (older man, glasses, grey shirt) interviewed; he also appears at the blackboard throughout. **His name lower third ("Robert Bell, Statistician / AT&T Labs Research") appears at 4:13-4:17.**
   - The 1:48 three-man BellKor photo is not captioned person by person in the video. Don't label the faces individually (Bell, the older man, can be identified from the interviews).
   - 3:00-3:04 2007 leaderboard ("When Gravity and Dinosaurs Unite", BellKor 8.38%)
   - 3:30-3:46 Bell holding the serious-vs-escapist chart from the paper (Fig. 2)
   - 6:29-6:32 "September 21st, 2009" title over the final leaderboard
   - **6:33-6:38 Bell and Volinsky with medals holding the $1,000,000 Netflix check (dated 09.21.09)**
   - **6:41-6:43 group photo of the whole winning team on stage with the check at the ceremony** (the closest thing to ceremony footage found; no free video of the ceremony itself exists)
   - 7:12 David Belanger, AT&T chief scientist (lower third)
2. **yt_northeastern_drone.mp4** -- CampusMania, "Northeastern University | 4K Campus Drone Tour" (2022-08-10), https://www.youtube.com/watch?v=rWB_thEvs20 , 4:33, 1080p (transcoded from AV1). **"MT" watermark top-right throughout.** Burned text at 0:00-0:07 (title), about 0:30-0:40 ("June 02, 2022", "Carter Playground"), 1:03 ("Christian Science Plaza", which is not Northeastern), 1:31 ("Mary Baker Eddy Library"), 2:06 ("Symphony Hall"), and an end card with subscribe button and person at 4:25+.
   - Best Northeastern shots: about 2:20-2:50 (Krentzman Quad, Ell Hall, the brick "NORTHEASTERN UNIVERSITY" sign; a big "2022" sculpture is in frame), 2:48-3:10 (aerial over the quad and campus buildings).
3. **yt_wsj_tiktok.mp4** -- The Wall Street Journal, "How TikTok's Algorithm Figures You Out | WSJ" (2021-07-21), https://www.youtube.com/watch?v=nfczi2cI6Cs , 13:02, 1080p (transcoded from VP9). **WSJ logo top-right throughout**; some burned subtitles on interview shots; contains real TikTok users' videos.
   - 0:40 wall of bot feeds; 1:00 "WATCH TIME" icon; 2:28-2:44 @kentucky_96 profile card (Depression / Sadness, age 24); 2:46 @virginia_13 card (Forestry / Yoga, 13); 4:40-5:00 hashtag-cluster visualization; 8:53-9:03 grid of kentucky_96's feed turning teal (depression videos); **9:05-9:07 "93% (278 videos) DEPRESSION RELATED"**.

YouTube downloads used: 3 of 5. Not downloaded: Rutgers "Dr. Yehuda Koren - The Netflix Prize Quest" (YWMzgCsFIFY, 60 min, over the length limit; it would be the only source of Koren on camera).
