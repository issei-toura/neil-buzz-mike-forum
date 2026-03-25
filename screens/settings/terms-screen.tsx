import { TERMS_OF_SERVICE } from '@/constants/legal';
import { LegalDocumentScreen } from '@/screens/settings/legal-document-screen';

export default function TermsOfServiceScreen() {
  return <LegalDocumentScreen title="Terms of service" body={TERMS_OF_SERVICE} />;
}
