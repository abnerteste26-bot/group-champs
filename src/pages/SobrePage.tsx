import { Trophy, Target, Users } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center">
        <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>SOBRE NÓS</h1>
        <p className="text-muted-foreground">Conheça a Copa Master</p>
      </div>

      <div className="card-copa p-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-foreground font-bold mb-1">Nossa Missão</h3>
            <p>Promover a integração esportiva através de campeonatos organizados com transparência, fair play e competitividade saudável.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h3 className="text-foreground font-bold mb-1">Quem Somos</h3>
            <p>A Copa Master é um campeonato regional que reúne os melhores times da região. Com organização profissional, nosso objetivo é proporcionar uma experiência esportiva de alto nível para jogadores e torcedores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
