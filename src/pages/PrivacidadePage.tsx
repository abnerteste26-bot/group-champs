import { Lock } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>POLÍTICA DE PRIVACIDADE</h1>
        <p className="text-muted-foreground text-sm">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="card-copa p-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h3 className="text-foreground font-bold mb-2">1. Dados Coletados</h3>
          <p>Coletamos apenas os dados necessários para a organização do corujão: nome do time, nome do responsável, número de WhatsApp e escudo do time.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">2. Uso dos Dados</h3>
          <p>Seus dados são utilizados exclusivamente para gestão do corujão, comunicação sobre partidas e resultados, e organização dos grupos e classificações.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">3. Compartilhamento</h3>
          <p>Não compartilhamos seus dados pessoais com terceiros. Informações públicas como nome do time, escudo e resultados são exibidos na plataforma para todos os participantes.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">4. Segurança</h3>
          <p>Utilizamos medidas de segurança para proteger seus dados, incluindo criptografia e controle de acesso restrito às informações sensíveis.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">5. Seus Direitos</h3>
          <p>Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato com a organização através da página de suporte.</p>
        </section>
      </div>
    </div>
  );
}
