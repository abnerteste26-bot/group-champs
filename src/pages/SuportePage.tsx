import { HelpCircle, MessageCircle, BookOpen } from "lucide-react";

export default function SuportePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center">
        <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>SUPORTE</h1>
        <p className="text-muted-foreground">Como podemos ajudar?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-copa p-6 text-center">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold mb-2">Contato</h3>
          <p className="text-sm text-muted-foreground mb-4">Fale diretamente com a organização do corujão para dúvidas, sugestões ou reclamações.</p>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        <div className="card-copa p-6 text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-bold mb-2">Regulamento</h3>
          <p className="text-sm text-muted-foreground mb-4">Consulte as regras oficiais do corujão, critérios de classificação e código de conduta.</p>
          <button className="btn-gold inline-flex items-center gap-2 text-sm opacity-60 cursor-not-allowed">
            <BookOpen className="w-4 h-4" />
            Em breve
          </button>
        </div>
      </div>

      <div className="card-copa p-6 space-y-4">
        <h3 className="font-bold">Perguntas Frequentes</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-foreground font-semibold">Como faço para inscrever meu time?</p>
            <p className="text-muted-foreground">Acesse a página de Inscrição, preencha o formulário com os dados do time e aguarde a aprovação da organização.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold">Como envio o resultado de uma partida?</p>
            <p className="text-muted-foreground">Após fazer login com as credenciais do seu time, acesse a Área do Time e envie o placar da partida.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold">Posso contestar um resultado?</p>
            <p className="text-muted-foreground">Sim, entre em contato com a organização através do WhatsApp informando o motivo da contestação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
