import NotDoneYet from "../components/NotDoneYet";
import { translations } from "../i18n";

export default function CalendarPage({ language = "pl" }) {
	const t = translations[language];
	return <NotDoneYet text={t.calendar} language={language} />;
}
