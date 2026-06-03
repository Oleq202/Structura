import NotDoneYet from "../components/NotDoneYet";
import { translations } from "../i18n";

export default function LogsPage({ language = "pl" }) {
    const t = translations[language];
    return <NotDoneYet text={t.logs} language={language} />;
}
