import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { Call } from '../services/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function shareCall(call: Call) {
  const deadline = format(parseISO(call.submissionDeadline), 'dd MMMM yyyy', { locale: fr });

  const message = [
    `ðŸ“¢ *${call.title}*`,
    ``,
    `ðŸ“Œ Type: ${call.type}`,
    `ðŸ—“ Deadline: ${deadline}`,
    call.locationCountry ? `ðŸ“ ${call.locationCity ?? ''} ${call.locationCountry}`.trim() : '',
    ``,
    call.externalUrl ? `ðŸ”— ${call.externalUrl}` : '',
    ``,
    `_Partagé via ResearchCall —” L'agrégateur d'appels scientifiques de l'Afrique francophone_`,
    `researchcall://calls/${call.id}`,
  ]
    .filter(Boolean)
    .join('\n');

  await Share.share({ message, title: call.title });
}