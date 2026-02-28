import { FileText } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>TERMOS DE USO</h1>
        <p className="text-muted-foreground text-sm">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
      </div>

      <div className="card-copa p-6 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h3 className="text-foreground font-bold mb-2">1. Aceitação dos Termos</h3>
          <p>Ao acessar e utilizar a plataforma Corujão Master, você concorda com estes Termos de Uso. Caso não concorde, recomendamos que não utilize nossos serviços.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">2. Inscrição e Participação</h3>
          <p>A inscrição no campeonato está sujeita à aprovação da organização. Cada time deve ter um responsável que será o ponto de contato oficial. Os times devem respeitar o regulamento do campeonato.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">3. Conduta</h3>
          <p>Todos os participantes devem manter conduta esportiva e respeitosa. A organização reserva-se o direito de desclassificar times que violem o regulamento ou apresentem comportamento antidesportivo.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">4. Resultados e Classificação</h3>
          <p>Os resultados enviados pelos times estão sujeitos à confirmação da organização. Contestações devem ser realizadas dentro do prazo estabelecido no regulamento.</p>
        </section>
        <section>
          <h3 className="text-foreground font-bold mb-2">5. Alterações</h3>
          <p>A organização pode alterar estes termos a qualquer momento, comunicando as mudanças através da plataforma.</p>
        </section>
      </div>
    </div>
  );
}
