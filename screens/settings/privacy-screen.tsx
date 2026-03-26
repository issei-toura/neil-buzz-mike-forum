import { PRIVACY_POLICY } from '@/constants/legal';
import { LegalDocumentScreen } from '@/screens/settings/legal-document-screen';

export default function PrivacyPolicyScreen() {
  return <LegalDocumentScreen title="Privacy policy" body={PRIVACY_POLICY} />;
}
