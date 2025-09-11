Rapport d’études relatif au portage JAVA des fonctionnalités de matching entre le verbatim et le tagging

OBJECTIF DU DOCUMENT

Ce document a pour but de lister toutes les exigences techniques et fonctionnelles liées au portage éventuel de l’outil permettant de faire la réconciliation entre le tagging et le verbatim. Cet outil a été développé avec le langage VBA et serait réécrit en Java.
Ce portage apporte aussi quelques évolutions :
• la traçabilité des demandes,
• la gestion des erreurs,
• la gestion des correctifs.
SPÉCIFICATIONS FONCTIONNELLES

L’application de matching des tags et du verbatim a pour objectif de rapprocher les tags de la retranscription de la séance.

Les principales fonctionnalités seront les suivantes :
• Génération des fichiers en lien avec le matching
• Correction des fichiers produits suite au matching
• Sauvegarde de ces matching au sein d’une base de données après validation


CONNEXION A L’APPLICATION
AUTH-001 - Connexion à l’application

En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir me connecter de façon sécurisée afin d’utiliser de manière sécurisée l’application de matching.

Critères d'acceptation :

    • L’utilisateur doit être authentifié et autorisé pour accéder à l’application
    • Si l’utilisateur n’a pas accès, un message d’erreur générique doit être affiché


GÉNÉRATION DES FICHIERS DE MATCHING

GEN-003 - Lancement du processus de matching
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir lancer le processus de matching entre le verbatim et le tagging afin de catégoriser automatiquement chaque intervention par son intervenant.

Critères d'acceptation :

    • Le processus démarre uniquement quand les deux fichiers sont validés
    • Une barre de progression indique l'avancement du traitement
    • L'utilisateur peut annuler le processus en cours
    • A la fin du processus, les deux fichiers utilisés sont déplacés dans un dossier “archive”


GEN-004 - Consultation des résultats
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir consulter les résultats du matching afin de vérifier que chaque intervention a été correctement attribuée à son intervenant.

Critères d'acceptation :

    • Les résultats affichent chaque intervention avec son intervenant identifié
    • Les interventions non attribuées sont clairement signalées
    • Les interventions qui ont été attribuées par défaut car pas de tagging clair
    • L'utilisateur peut exporter les résultats dans un format exploitable


CORRECTION DES FICHIERS DE MATCHING

COR-001 - Détection des erreurs de matching
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir identifier les erreurs de matching entre le verbatim et le tagging afin de corriger les attributions incorrectes d'intervenants.

Critères d'acceptation :

    • L'application détecte les interventions non attribuées à un intervenant
    • Les décalages temporels entre les éléments du verbatim et les éléments de tagging sont signalés. Par exemple: 
        ◦ Des points à l’ordre du jour manquants ou supplémentaires sans verbatim. 
        ◦ Des interventions attribuées à un tag et un décalage se produit pour les autres interventions
    • Une liste des erreurs est affichée avec leur localisation dans le fichier


COR-002 - Correction manuelle des attributions
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir corriger manuellement l'attribution d'une intervention à un intervenant afin de rectifier les erreurs de matching automatique.

Critères d'acceptation :

    • L'utilisateur peut sélectionner une intervention mal attribuée
    • Une liste déroulante propose les intervenants disponibles dans la session
    • La correction est immédiatement visible dans l'interface


COR-003 - Validation des corrections
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir valider l'ensemble de mes corrections afin de m'assurer que tous les débats sont correctement catégorisés par intervenant.

Critères d'acceptation :

    • Un récapitulatif des corrections effectuées est affiché
    • L'utilisateur peut annuler une correction avant validation finale
    • Le système vérifie qu'aucune intervention ne reste non attribuée

ENREGISTREMENT DES MATCHINGS

ENR-001 - Sauvegarde du matching corrigé
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir sauvegarder le résultat du matching corrigé afin de conserver le travail de catégorisation effectué.

Critères d'acceptation :

    • Le matching est sauvegardé en base de données.
    • Toutes les corrections manuelles sont incluses dans cette sauvegarde

ENR-002 - Historique des versions
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir accéder à l'historique des versions de matching d'une session afin de tracer les modifications apportées.

Critères d'acceptation :

    • Chaque sauvegarde est horodatée et versionnée


ENR-003 - Export des résultats finaux [optionnel]
En tant qu'utilisateur de la Chambre des Députés, je veux pouvoir exporter le matching final dans différents formats afin d'utiliser les données dans d'autres outils d'analyse parlementaire.

Critères d'acceptation :

    • Export possible en CSV avec colonnes : horodatage, intervenant, contenu intervention


RÉFÉRENTIEL DE CORRESPONDANCE

REF-001 - Configuration du fichier de référentiel
En tant que membre de l'équipe IT, je veux pouvoir créer et maintenir un fichier de configuration de correspondances entre les termes du verbatim et les titres d'événements du tagging afin d'améliorer la précision du matching automatique.

Critères d'acceptation :

    • Le fichier de configuration respecte un format structuré (JSON, XML ou CSV)
    • Chaque correspondance indique : terme_verbatim, titre_evenement, type_correspondance (exacte/approximative)
    • Le fichier est documenté avec des exemples et la syntaxe attendue


REF-002 - Définition des correspondances exactes
En tant que membre de l'équipe IT, je veux pouvoir définir des correspondances exactes dans le fichier de configuration afin d'assurer un matching précis pour les expressions standardisées.

Critères d'acceptation :

    • Les correspondances exactes sont marquées avec un indicateur spécifique (ex: "type": "exact")
    • La correspondance exacte ne tolère aucune variation orthographique
    • La syntaxe du fichier permet de distinguer clairement les correspondances exactes


REF-003 - Définition des correspondances approximatives
En tant que membre de l'équipe IT, je veux pouvoir définir des correspondances approximatives avec seuil de similarité dans le fichier de configuration afin de gérer les variations orthographiques et les synonymes.

Critères d'acceptation :

    • Les correspondances approximatives incluent un seuil de similarité configurable (ex: "similarity": 0.8)
    • Le type "approximative" est clairement identifié dans le fichier
    • La documentation explique comment calculer et ajuster les seuils


REF-004 - Chargement automatique du référentiel
En tant qu'application, je veux charger automatiquement le référentiel de correspondance au démarrage afin de bénéficier de ces correspondances sans intervention manuelle

Critères d'acceptation :

    1. L'application lit le fichier de configuration au démarrage
    2. Un message d'erreur s'affiche si le fichier est mal formaté ou absent
    3. Le nombre de correspondances chargées est affiché dans les logs
