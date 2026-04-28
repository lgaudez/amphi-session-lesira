# Fix icone Check et notes par poste

## Contexte

Le dernier commit a corrigé un écran blanc en ajoutant un contournement dans `vite.config.js` :

- `define.Check = 'CheckCircle2'`

Ce correctif masque un problème de code source : le composant `Check` est utilisé dans `src/App.jsx` dans le multi-select, mais n'est pas importé depuis `lucide-react`.

En parallèle, l'application a besoin d'une fonctionnalité de notes libres par poste, utilisables depuis les deux vues principales :

- `Explorateur`
- `Mon Ranking`

Ces notes doivent être partagées entre les deux vues, persistées localement, et transportées dans l'export/import de session.

## Objectifs

- Supprimer le hack de configuration Vite et corriger la cause réelle.
- Ajouter une note libre par poste, modifiable facilement depuis les deux vues.
- Garantir que la note affichée dans `Explorateur` et `Mon Ranking` provient de la même source d'état.
- Préserver la simplicité actuelle de l'application, sans refonte large de l'architecture.

## Hors périmètre

- Synchronisation distante ou multi-utilisateur.
- Historique des notes.
- Notes structurées (`pour / contre / relance`).
- Refonte complète de `src/App.jsx` en plusieurs fichiers.

## Etat actuel

L'application est majoritairement concentrée dans `src/App.jsx`.

Les états persistés existants sont :

- `shortlisted`
- `taken`

Ils sont stockés dans `localStorage`, puis exportés/importés via un JSON de session.

Les deux vues affichent déjà un détail de poste extensible :

- `JobDetailCard` dans l'explorateur
- `SortableItem` + `JobDetailCard` dans le ranking

Cette structure permet d'ajouter l'édition des notes au même endroit dans les deux parcours sans introduire de navigation supplémentaire.

## Approche retenue

### 1. Corriger la cause réelle du bug d'icône

Le code doit importer explicitement `Check` depuis `lucide-react` dans `src/App.jsx`.

Le champ `define` ajouté dans `vite.config.js` doit être supprimé.

Conséquence attendue :

- le JSX du multi-select référence un composant réellement importé ;
- la configuration Vite ne contient plus de substitution implicite fragile ;
- le comportement devient indépendant d'un alias de build ad hoc.

### 2. Introduire une source d'état unique pour les notes

Ajouter un nouvel état local :

- `notesByPostId: Record<string, string>`

Clé :

- identifiant du poste (`Référence`)

Valeur :

- contenu texte libre de la note

Règles :

- si la note est vide après trim, l'entrée est supprimée ;
- l'absence de clé signifie "aucune note".

Cette map devient l'unique source de vérité consommée par les deux vues.

### 3. Persister les notes comme le reste de la session

Ajouter une nouvelle clé `localStorage` dédiée aux notes.

Le chargement initial de l'application doit lire :

- `ira_shortlisted`
- `ira_taken`
- `ira_notes`

L'application doit écrire automatiquement les notes dans `localStorage` quand elles changent.

### 4. Etendre l'export/import de session

Le JSON exporté doit inclure :

- `shortlisted`
- `taken`
- `notes`

Comportement d'import :

- un export récent recharge les trois états ;
- un ancien export sans `notes` reste accepté ;
- dans ce cas, les notes locales sont remplacées par un objet vide.

Ce choix évite un état hybride après import et garde un comportement simple à comprendre : l'import remplace la session courante.

## Design UX

### Point d'entrée

Chaque poste doit exposer une action `Notes` dans les deux vues.

L'action doit être :

- visible sans surcharger la ligne ;
- identifiable comme éditable ;
- mise en évidence lorsqu'une note existe déjà.

### Zone d'édition

L'édition se fait inline, dans la zone déjà extensible du poste.

Pourquoi :

- pas de modal supplémentaire ;
- pas de changement de contexte ;
- réutilisation du pattern déjà existant de détail développé.

Le composant d'édition contient uniquement :

- un libellé court ;
- un `textarea` ;
- éventuellement un compteur ou une aide très légère si nécessaire.

Il n'y a pas de bouton "sauvegarder" : la sauvegarde est automatique à la saisie.

### Comportement inter-vues

Si l'utilisateur modifie une note dans `Explorateur`, puis ouvre le même poste dans `Mon Ranking`, il voit immédiatement le même contenu, et inversement.

Le signal visuel "ce poste a une note" doit aussi être cohérent entre les deux vues.

## Architecture cible

Le code reste dans le périmètre actuel, sans gros découpage. L'objectif est un nettoyage ciblé.

### Responsabilités

- `App` reste propriétaire des états de session (`shortlisted`, `taken`, `notesByPostId`).
- `JobDetailCard` reçoit la note du poste et les callbacks d'édition.
- Les vues liste / ranking ne font que passer les données et déclencher l'ouverture des détails.

### API interne proposée

Dans `App` :

- `getNote(postId)` ou lecture directe via `notesByPostId[postId]`
- `updateNote(postId, value)`

Règles d'implémentation pour `updateNote` :

- normaliser la valeur texte ;
- supprimer la clé si la note est vide ;
- ne pas muter l'objet précédent.

Cette interface est suffisante pour éviter de disperser la logique de nettoyage dans plusieurs composants.

## Gestion des erreurs et compatibilité

- Si `localStorage` contient une valeur invalide, l'application retombe sur un objet vide pour les notes.
- Si un fichier importé ne contient pas `notes`, l'import réussit quand même.
- Si un poste n'a pas de note, aucun affichage parasite ne doit apparaître dans l'éditeur.

## Tests attendus

### Régression bug icône

- vérifier que `vite.config.js` ne contient plus le contournement ;
- vérifier que le build et/ou le lint passent avec le vrai import `Check`.

### Notes

- création d'une note depuis `Explorateur` ;
- lecture de la même note dans `Mon Ranking` ;
- suppression implicite en vidant le champ ;
- persistance après rechargement ;
- présence des notes dans l'export JSON ;
- import d'un JSON avec `notes` ;
- import d'un JSON ancien sans `notes`.

## Risques et arbitrages

### Rester dans `src/App.jsx`

Ce fichier est déjà volumineux. Une extraction plus large serait défendable, mais elle augmenterait le risque et le scope du changement. Pour cette demande, le bon compromis est :

- un nettoyage local ;
- un petit composant réutilisable si nécessaire ;
- pas de refactor structurel large.

### Sauvegarde automatique

L'auto-save est préférable ici à un bouton de validation :

- moins de friction pendant l'amphi ;
- moins d'états d'interface ;
- comportement cohérent avec une note de travail rapide.

## Résultat attendu

Après implémentation :

- le bug d'icône est corrigé à la source ;
- `vite.config.js` redevient propre ;
- chaque poste peut porter une note libre ;
- cette note est visible et modifiable depuis `Explorateur` et `Mon Ranking` ;
- les notes persistent localement et suivent l'export/import de session.
