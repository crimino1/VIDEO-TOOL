"""Shot list for You vs 5 Apex Predators. Times are in the tightened voice (assets/vo.wav).
YouTube section files start at the section start; V() takes the ORIGINAL video time and subtracts it (see OFF in build_apex)."""
from build_apex import V, montage, strip, L
from lib import ST

END_CARD = 45.45


def ending(a, b):
    for i, (src, ss, cx, cy) in enumerate([("yt:jel_kt", 20.0, 0.55, 0.5), ("yt:bear_crew", 41.0, 0.5, 0.45), ("yt:croc_bp", 76.0, 0.5, 0.5),
                                            ("yt:tig_8k", 367.2, 0.3, 0.45), ("yt:orca_u", 362.0, 0.5, 0.5)]):
        strip(i, src, ss, cx, cy)(a, b)


SHOTS = [
    (0.00, V("px:hook_0", 1.0, zoom=(1.08, 1.0))),                                   # You versus the five deadliest predators
    (2.00, montage(V("yt:jel_kt", 18.0, 0.55), V("yt:bear_crew", 36.0, 0.5), V("yt:croc_bp", 57.0, 0.5),
                   V("yt:tig_8k", 6.8, 0.62), V("yt:orca_u", 362.0, 0.5))),      # predators on earth
    (3.20, V("yt:orca_u", 364.0, 0.5, zoom=(1.0, 1.08))),                            # only one of them lets you live
    # 1 box jellyfish
    (5.06, V("yt:jel_kt", 16.0, 0.6)),                                               # Box jellyfish
    (6.30, V("yt:jel_kt", 21.0, 0.55)),                                              # no teeth, no brain
    (7.92, V("yt:jel_box", 199.0, 0.42)),                                            # almost invisible
    (9.14, V("yt:jel_kt", 25.5, 0.38, dark=0.08)),                                   # one bad sting attacks your heart
    (11.30, V("yt:jel_box", 210.5, 0.6)),                                            # you've got a few minutes
    # 2 polar bear
    (12.58, V("yt:bear_arc", 12.6, 0.44, 0.45, 0.6)),                                     # Polar bear
    (13.40, V("px:bearL_2", 6.0, 0.5, zoom=(1.0, 1.05))),                            # it smelled you from a mile away
    (15.16, V("yt:bear_crew", 34.5, 0.5, 0.5)),                                      # you can't outrun it
    (16.20, V("yt:bear_gp", 67.0, 0.5)),                                             # you can't outswim it
    (17.56, V("yt:bear_hunt", 33.0, 0.27)),                                          # maybe a minute
    # 3 saltwater crocodile
    (18.68, V("yt:croc_bp", 75.6, 0.55)),                                            # Saltwater crocodile
    (19.98, V("px:river_4", 1.0, zoom=(1.0, 1.06))),                                 # you're standing at the river's edge
    (21.78, montage(V("yt:croc_bp", 55.6, 0.55, zoom=(1.0, 1.1)), V("px:crocL_7", 1.2, 0.62, zoom=(1.0, 1.08)), V("px:crocL_7", 3.0, 0.62, zoom=(1.08, 1.14)))),   # hits you with the strongest bite
    (24.38, montage(V("yt:croc_bp", 35.3, 0.6), V("yt:croc_bp", 42.0, 0.45))),      # drags you under, and spins
    (26.56, V("px:crocL2_2", 11.6, 0.55)),                                           # two seconds
    # 4 tiger
    (27.58, V("px:tiger3_2", 1.0)),                                                  # Tiger
    (28.24, V("px:tigerL2_0", 3.0, 0.62)),                                           # it attacks from behind
    (29.16, V("yt:tig_walk", 34.0, 0.55, dark=0.06)),                                # you never even see it
    (31.26, V("yt:tig_8k", 361.4, 0.5, 0.45, zoom=(1.0, 1.1))),                                    # zero seconds
    # 5 orca
    (32.52, V("yt:orca_m", 418.0, 0.64)),                                             # and the orca
    (33.40, V("yt:orca_u", 366.0, 0.5)),                                             # six tons (size panel on top)
    (34.36, montage(V("yt:shark_wso", 1.4, 0.45), V("yt:shark_wso", 40.5, 0.55))),  # it kills great white sharks
    (36.22, V("yt:blue_a", 33.5, 0.5)),                                              # it kills blue whales
    (37.66, V("px:orcaL_0", 7.0, 0.55)),                                             # but there's no recorded case
    (39.60, V("yt:orca_a", 437.0, 0.5)),                                             # of a wild orca ever killing a human
    (41.70, V("yt:orca_s", 687.0, 0.5)),                                             # it could. it just doesn't.
    (43.88, V("yt:orca_2", 587.0, 0.5, zoom=(1.0, 1.05))),                           # and nobody knows why
    (END_CARD, ending),                                                              # so which one would you fight?
]
