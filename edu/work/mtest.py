from manim import *
tpl = TexTemplate(tex_compiler="xelatex", output_format=".xdv")
tpl.add_to_preamble(r"""
\usepackage{mathspec}
\setmainfont[Path=C:/Users/daggu222105/VIDEO-TOOL/edu/assets/fonts/]{Kalam-Regular.ttf}
\setmathsfont(Digits,Latin)[Path=C:/Users/daggu222105/VIDEO-TOOL/edu/assets/fonts/]{Kalam-Regular.ttf}
\setmathsfont(Greek)[Scale=0.95]{Segoe Print}
\setmathrm[Path=C:/Users/daggu222105/VIDEO-TOOL/edu/assets/fonts/]{Kalam-Regular.ttf}
""")
class Test(Scene):
    def construct(self):
        e = VGroup(MathTex(r"\sin^2\theta+\cos^2\theta=1", tex_template=tpl, font_size=72),
                   MathTex(r"\sin\theta=\frac{o}{h}\quad \tan 30^\circ=\frac{1}{\sqrt{3}}\quad \pi,\ \alpha,\ \beta", tex_template=tpl, font_size=72),
                   MathTex(r"\sin(90^\circ-\theta)=\cos\theta", tex_template=tpl, font_size=72)).arrange(DOWN)
        self.add(e)
