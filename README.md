# Job Explorer - ESIRA

Application interactive d'aide au choix de postes pour les diplômés de l'ESIRA (**Amphi Blanc**).

Développé avec ❤️ par [Gaudez Tech Lab](https://www.gaudeztechlab.com).

## 🎯 Pourquoi cet outil ?

L'**Amphi Blanc** est un moment crucial pour les futurs administrateurs de l'ESIRA. Avec des centaines de postes répartis sur toute la France et dans divers ministères, la prise de décision peut être complexe.

Cet outil a été conçu pour :
- **Centraliser les données** : Accès direct aux informations des postes via une interface fluide.
- **Simuler ses choix** : Créer une liste personnalisée de postes favoris.
- **Prioriser stratégiquement** : Classer ses choix par ordre de préférence grâce au système de *Ranking*.
- **Anticiper en temps réel** : Marquer les postes "pris" par d'autres candidats pour ajuster instantanément sa stratégie.
- **Éviter les erreurs** : Visualisation claire des départements et ministères pour garantir une cohérence géographique et professionnelle.

## 🚀 Fonctionnalités

- **Explorateur interactif** : Filtrage avancé par Ministères, Thématiques, Région, Département et Environnement.
- **Recherche intelligente** : Recherche multi-critères par mots-clés ou IDs de postes.
- **Gestion de session** : Système de favoris (Shortlist) et de classement (Ranking) par Drag & Drop.
- **Synchronisation réelle** : Données extraites dynamiquement depuis un Google Sheet source.
- **Export/Import** : Sauvegardez et reprenez votre progression via des fichiers JSON.
- **Design Professionnel** : Interface sobre, responsive et optimisée pour la lecture dense.

## 🛠️ Stack Technique

- **Framework** : React + Vite
- **Styling** : Tailwind CSS
- **Data** : PapaParse (CSV Parsing)
- **Drag & Drop** : @dnd-kit
- **Iconographie** : Lucide React

## 📦 Installation & Développement

1. Clonez le dépôt
2. Installez les dépendances : `npm install`
3. Lancez le serveur de dev : `npm run dev`
4. Accédez à l'app : `http://localhost:5173/amphi-session-lesira/`

## 📄 Licence

Propulsé par **Gaudez Tech Lab**. Tous droits réservés.
