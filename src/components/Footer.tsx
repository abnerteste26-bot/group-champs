import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="text-lg font-black tracking-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
                CORUJÃO MASTER
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O corujão mais emocionante da região. Organização, transparência e fair play.
            </p>
          </div>

          {/* Campeonatos */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              Corujões
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/classificacao" className="hover:text-primary transition-colors">Classificação</Link></li>
              <li><Link to="/partidas" className="hover:text-primary transition-colors">Partidas</Link></li>
              <li><Link to="/inscricao" className="hover:text-primary transition-colors">Inscrição</Link></li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              Institucional
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/sobre" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="hover:text-primary transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              Suporte
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/suporte" className="hover:text-primary transition-colors">Central de Ajuda</Link></li>
              <li><Link to="/suporte" className="hover:text-primary transition-colors">Contato</Link></li>
              <li><Link to="/suporte" className="hover:text-primary transition-colors">Regulamento</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Corujão Master. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-primary transition-colors">Termos</Link>
            <Link to="/suporte" className="hover:text-primary transition-colors">Suporte</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
