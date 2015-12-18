/*
 *
 * 1.0 - Déclaration de la fonction superPatate
 *     1.1 - Associe l'objet des options du plugin et/ou celles définies par l'utilisateur à la variable settings
 *     1.2 - Associe l'objet classes du plugin èa la variable classes
 *     1.3 - Toggle la classe principale du plugin à l'élément du DOM qui instancie le plugin
 *     1.4 - Garde en mémoire divers autres éléments
 *         1.4.1 - Le sélecteur utilisé pour instancier le plugin
 *         1.4.2 - Le contenu pour chacun des auteurs
 *         1.4.3 - La balise body de la page
 *         1.4.4 - Affiche ou cache la scrollbar selon l'option choisie
 *         1.4.5 - Le contenu pour chacun des auteurs (suite)
 *     1.5 - Génère la page présentation si elle est demandée dans les options
 *     1.6 - Affiche les maquettes selon la hiérarchie que j'ai choisi
 *     1.7 - Affiche la bonne page au chargement de la page
 *     1.8 - Retourne l'élément présentation (pour utilisation du jQuery en chaine) 
 * 2.0 - Déclaration des options (valeurs par défaut)
 *     2.1 - Objet contenant les options de couleurs
 *     2.2 - Options principales du plugin (celles qui devraient absolument être modifiées par l'utilisateur)
 *     2.3 - Options d'interface pour le plugin (quoi afficher ou pas)
 * 3.0 - Déclaration des classes
 *     3.1 - Classe principale du plugin
 *     3.2 - Classes pour la section intro
 *     3.3 - Classes pour le slider des maquettes
 *     3.4 - Classes pour le menu de navigation du slider
 * 4.0 - Déclaration de la fonction pour générer la section intro
 * 5.0 - Déclaration de la fonction pour générer le slider des maquettes
 *     5.1 - Génère le menu et le slider
 *     5.2 - Associe les bon styles de couleurs aux éléments
 *     5.3 - Fontion pour gérer le resize de certains élément sur le resize de la fenêtre
 *         5.3.1 - Fix pour le slider
 *         5.3.2 - Calcule la largeur des slides pour avoir les maquettes côte à côte
 *         5.3.3 - Repositionne le slider vis-à-vis la bonne maquette
 * 6.0 - Déclaration de la fonction pour gérer les événements pour les slide
 *
 */

(function ($) {


    /* ===================================================================
     * ========== 1.0 - Déclaration de la fonction superPatate ==========
     * ================================================================ */

    /* PARAM:
     * options = les options déterminées par l'utilisateur
     */
    $.fn.superPatate = function (options) {

        /* ========== 1.1 - Associe l'objet des options du plugin et/ou celles définies par l'utilisateur à la variable settings ========== */

        var settings = $.extend({}, $.fn.superPatate.defaults, options);

        /* ========== 1.2 - Associe l'objet classes du plugin à la variable classes ========== */

        var classes = $.fn.superPatate.classes;

        /* ========== 1.3 - Toggle la classe principale du plugin à l'élément du DOM qui instancie le plugin ========== */

        this.toggleClass(classes.mainClass);

        /* ========== 1.4 - Garde en mémoire divers autres éléments (la classe ou l'id utilisé pour instancier le plugin) ========== */


        var selector = this.selector, // 1.4.1 - Le sélecteur utilisé pour instancier le plugin
            auteursContent = [], // 1.4.2 - Le contenu pour chacun des auteurs

            // 1.4.3 - La balise body de la page
            body = $('body').css({
                color: settings.colors.textColor,
                backgroundColor: settings.colors.backgroundColor
            });

        // 1.4.4 - Affiche ou cache la scrollbar selon l'option choisie
        if (settings.hideScrollBar)
            body.toggleClass('hideScrollBar');

        // 1.4.5 - Le contenu pour chacun des auteurs (suite)
        $(selector + '> *').each(function () {
            auteursContent.push($(this));
            // Enlève le contenu ajouté par l'utilisateur pour l'ajouter selon la bonne hiérarchie en 1.6
            $(this).remove();
        });

        /* ========== 1.5 - Ajoute la section intro si elle est demandée dans les options ========== */

        if (settings.ajouteSectionIntro) {
            this.prepend(genererSectionIntro(settings, classes)); // Appelle la fonction genererSectionIntro() qui crée la page de présentation

            // Modifie dynamiquement le css de la section intro
            $("." + classes.introSectionTitleClass).css({
                backgroundColor: settings.colors.highlightColor,
                color: settings.colors.backgroundColor
            });
            $('.' + classes.introLinkClass).css({
                color: settings.colors.highlightColor
            });
        }

        /* ========== 1.6 - Affiche les maquettes selon la hiérarchie que j'ai choisi ========== */

        this.append(genererSlider(settings, classes, auteursContent)); // Appelle la fonction genererSlider() qui crée le slider
        sliderNavColors(settings, classes);

        // Gère l'événement resize sur la fenêtre du navigateur
        onWindowResize(classes);
        $(window).resize(function () {
            onWindowResize(classes);
        });

        // Gère les événements clock sur les différents liens sur la page (changer de section, afficher la bonne maquette)
        $('a').on('click', function () {
            /* Timeout parce que sinon, trop rapide et prends le GET avant qu'il arrive dans le url */
            setTimeout(function () {
                gererEvSlide(classes);
            }, 100);
        });
        // L'exécute une première fois au chargement de la page (pour éviter de recommencer au complet lors d'un F5 par exemple)
        gererEvSlide(classes);

        /* ========== 1.7 - Affiche la bonne page au chargement de la page  ========== */

        /* ========== 1.8 - Retourne l'élément présentation (pour utilisation du jQuery en chaine)  ========== */

        return this;

    };


    /* ========================================================================
     * ========== 2.0 - Déclaration des options (valeurs par défaut) ==========
     * ===================================================================== */

    $.fn.superPatate.defaults = {

        /* ========== 2.1 - Objet contenant les options de couleurs ========== */

        colors: {
            textColor: "#000", // STRING: Couleur des textes
            backgroundColor: "#FAFAFA", // STRING: Couleur de background de la page
            highlightColor: "#F44336" // STRING: Couleur utiliser pour mettre en valeur certains éléments */
        },

        /* ========== 2.2 - Options principales du plugin (celles qui devraient absolument être modifiées par l'utilisateur) ========== */

        titre: "Titre du projet", // STRING: Le titre du projet
        sousTitre: "Sous-titre du projet", // STRING: Le sous-titre du projet
        auteurs: ["votre nom"], // ARRAY: Tableau contenant le nom de tous les auteurs des maquettes
        description: "Projet présenté par:", // STRING: Texte affiché sur la section intro avant la liste des auteurs
        linkMore: 'Voir les maquettes', // STRING: Texte affiché sur le bouton more dans la page intro

        /* ========== 2.3 - Options d'interface pour le plugin (quoi afficher ou pas) ========== */

        ajouteSectionIntro: true, // BOOLEAN: Détermine si l'on ajoute une page de présentation avant d'afficher les maquettes
        afficheSousTitre: false, // BOOLEAN: Détermine si l'on affiche le sous-titre du projet
        maquetteSizeOrder: ['desktop', 'tablette', 'mobile'], // ARRAY: Détermine dans que ordre le format des maquette est présenté
        maquettesPageNames: ['Accueil', 'Page contenu'], // ARRAY: Détermine le nom des maquettes présentées
        useBlackFrame: false, // BOOLEAN: Spécifie si on doit utiliser les images de la tablette et du mobile en noir
        hideScrollBar: true // BOOLEAN: Spécifie si on doit cahcer la barre de défilement du browser
    };


    /* ===================================================
     * ========== 3.0 - Déclaration des classes ==========
     * ================================================ */

    $.fn.superPatate.classes = {

        /* ========== 3.1 - Classe principale du plugin ========== */

        mainClass: 'superPatate', // STRING: Classe principale qui englobe le plugin <section>

        /* ========== 3.2 - Classes pour la section intro ========== */

        introClass: 'superPatate-intro', // STRING: Classe pour la page de présentation <section> */
        introSectionTitleClass: 'superPatate-intro-section-title', // STRING: Classe pour la section titre dans la page de présentation <div>
        introTitleClass: 'superPatate-intro-title', // STRING: CLasse pour le titre dans la page de présentation <h1>
        introSousTitleClass: 'superPatate-intro-sousTitle', // STRING: CLasse pour le sous-titre dans la page de présentation <h2>
        introSectionAuteursClass: 'superPatate-intro-section-auteurs', // STRING: Classe pour la section des noms des auteurs <div>
        introAuteursTxtClass: 'superPatate-intro-txt-auteurs', // STRING: Classe pour le paragraphe de présentation
        introAuteursListClass: 'superPatate-intro-auteurs-list', // STRING: Classe pour la liste des nom des auteurs <ul>
        introAuteursClass: 'superPatate-intro-auteurs', // STRING: Classe pour le nom d'un auteur <li>
        introLinkClass: 'superPatate-intro-link', // STRING: Classe pour le bouton suite <button>

        /* ========== 3.3 - Classes pour le slider des maquettes ========== */

        sliderClass: 'superPatate-slider', // STRING: Classe pour la section slider <section>
        slidesClass: 'superPatate-slides', // STRING: Classe pour la section des maquettes <div>
        slideAuteurClass: 'superPatate-slide-auteur', // STRING: Classe pour un ensemble de slides associé à un auteur <ul>
        slidePageClass: 'superPatate-slide-page', // STRING: Classe pour un ensemble de slides associé à une page
        singleSlideClass: 'superPatate-single-slide', // STRING: Classe pour une seule slide (une maquette) <li>
        slideDesktopClass: 'superPatate-single-slide-desktop', // STRING: Classe pour une slide version desktop
        slideTabletteClass: 'superPatate-single-slide-tablette', // STRING: Classe pour une slide version tablette
        slideMobileClass: 'superPatate-single-slide-mobile', // STRING: Classe pour une slide version mobile

        /* ========== 3.4 - Classes pour le menu de navigation du slider ========== */

        navClass: 'superPatate-nav', // STRING: Classe pour la page des maquettes <section>
        navPageIntroClass: 'superPatate-nav-intro', // STRING: Classe pour le lien retour vers la page intro
        navAuteurClass: 'superPatate-nav-auteur', // STRING: Classe pour un ensemble de slides associé à un auteur <ul>
        navPageClass: 'superPatate-nav-page', // STRING: Classe pour un ensemble de slides associé à une page
        navSlideClass: 'superPatate-nav-slide', // STRING: Classe pour une seule slide (une maquette) <li>
        navDesktopClass: 'superPatate-nav-slide-desktop', // STRING: Classe pour une slide version desktop
        navTabletteClass: 'superPatate-nav-slide-tablette', // STRING: Classe pour une slide version tablette
        navMobileClass: 'superPatate-nav-slide-mobile' // STRING: Classe pour une slide version mobile
    };


    /* ====================================================================================
     * ========== 4.0 - Déclaration de la fonction pour générer la section intro ==========
     * ================================================================================= */

    /* PARAM:
     * settings = référence à $.fn.superPatate.defaults ainsi que les options déterminées par l'utilisateur
     * classes = référence à $.fn.superPatate.classes
     */
    function genererSectionIntro(settings, classes) {
        var listeAuteurs = "",
            sousTitre = "",
            btnNext = "";

        // Pour chacun des auteurs, concatène leur nom dans des éléments de liste
        for (i = 0; i < settings.auteurs.length; i++) {
            listeAuteurs += "<li class='" + classes.introAuteursClass + "'>" + settings.auteurs[i] + "</li>";
        }

        // Si l'option afficheSousTitre est vrai, concatène un sous-titre
        if (settings.afficheSousTitre) {
            sousTitre += "<h2 class='" + classes.introSousTitleClass + "'>" + settings.sousTitre + "</h2>"
        }
        // Concatène le bouton pour ouvrir le slider et fermer la section intro
        btnNext = "<a href='#?section=slider' class='" + classes.introLinkClass + "'>" + settings.linkMore + "</button>"

        // Retourne la concaténation de tous les éléments de la section intro
        return sectionIntro = $("<section class='" + classes.introClass + "'><div class='" + classes.introSectionTitleClass + "'><h1 class='" + classes.introTitleClass + "'>" + settings.titre + "</h1>" + sousTitre + "</div><div class='" + classes.introSectionAuteursClass + "'><p>" + settings.description + "</p><ul class='" + classes.introAuteursListClass + "'>" + listeAuteurs + "</ul>" + btnNext + "</div></section>");
    };

    /* ===========================================================================================
     * ========== 5.0 - Déclaration de la fonction pour générer le slider des maquettes ==========
     * ======================================================================================== */

    /* PARAM:
     * settings = référence à $.fn.superPatate.defaults ainsi que les options déterminées par l'utilisateur
     * classes = référence à $.fn.superPatate.classes
     * auteursContent = référence au tableau qui contiens les éléments du DOM pour chacun des auteurs
     */
    function genererSlider(settings, classes, auteursContent) {
        /* ========== 5.1 - Génère le menu et le slider ========== */

        // Déclare les variables
        var sectionSlider = $("<section class='" + classes.sliderClass + "'></section>"), // élément conteneur de la section slider
            nav = $("<nav class='" + classes.navClass + "'></nav>"), // élément conteneur du menu de navigation pour la section slider
            navUl = $("<ul></ul>"),
            divSlides = $("<div class='" + classes.slidesClass + "'></div>"), // élément conteneur du slider
            lienIntro = $("<li  class='" + classes.navPageIntroClass + "' ><a href='#?section=intro'>Introduction</a></li>");

        // Ajoute les éléments à la page
        nav.append(navUl);
        if (settings.ajouteSectionIntro)
            navUl.append(lienIntro);
        sectionSlider.prepend(nav, divSlides);

        /* ========== Pour chacun des auteurs ========== */
        for (var i = 0; i < auteursContent.length; i++) {
            // Déclare les variables
            var slideAuteurUl = $("<ul class='" + classes.slideAuteurClass + "'></ul>"), // élément conteneur des slides pour chacun des auteurs
                navAuteurLi = $("<li class='" + classes.navAuteurClass + "'></li>"), //  élément conteneur des liens pour chacun des auteurs dans le menu
                navAuteurLiA = $("<a href='' ></a>"), // ulNavLi suite
                navAuteurUl = $("<ul></ul>");

            // Intègre le bon texte dans le menu (nom des auteurs)
            var navAuteurLiATxt = auteursContent[i].attr('data-auteur');
            if (navAuteurLiATxt == "" || navAuteurLiATxt == undefined)
                navAuteurLiATxt = settings.auteurs[i]; // si le data-pageName est vide ou non défini, utilise les options

            navAuteurLiA.text(navAuteurLiATxt).attr('href', '#?section=slider&auteur=' + i);

            // Ajoute les éléments à la page
            divSlides.append(slideAuteurUl);
            navUl.append((navAuteurLi.append(navAuteurLiA, navAuteurUl)));

            /* ========== Pour chacune des pages ========== */
            for (var j = 0; j < auteursContent[i].children().length; j++) {
                // Déclare les variables
                var slidePageli = $("<li class='" + classes.slidePageClass + "'></li>"), // élément conteneur pour chacune des différentes pages de la maquette
                    slidePageUl = $("<ul></ul>"),
                    navPageLi = $("<li class='" + classes.navPageClass + "'></li>"), // élément conteneur des liens pour chacune des pages de la maquette dans le menu
                    navPageLiA = $("<a href='' ></a>"), // navPageLi suite
                    navPageUl = $("<ul></ul>"); // élément conteneur des liens pour chacune des maquettes dans le menu

                // Intègre le bon texte dans le menu (nom des pages)
                var navPageLiATxt = auteursContent[i].children().eq(j).attr('data-pageName');
                if (navPageLiATxt == "" || navPageLiATxt == undefined)
                    navPageLiATxt = settings.maquettesPageNames[i]; // si le data-pageName est vide ou non défini, utilise les options

                navPageLiA.text(navPageLiATxt).attr('href', navAuteurLiA.attr('href') + '&page=' + j);

                // Ajoute les éléments à la page
                slideAuteurUl.append(slidePageli.append(slidePageUl));
                navAuteurUl.append(navPageLi.append(navPageLiA, navPageUl));

                /* ========== Pour chacune des maquettes de la page (les différents formats) ========== */
                var length = auteursContent[i].children().eq(j).find('img').length;
                for (var k = 0; k < length; k++) {
                    // Déclare les variables
                    var slideFormatLi = $("<li></li>"), // élément conteneur pour l'image de la maquette
                        slideFormatDiv = $("<div></div>"), // Élément permettant l'ajout du frame de la tablette ou du mobile autour de l'image
                        slideFormatDiv2 = $("<div></div>"), // slideFormatDiv suite
                        slideImg = auteursContent[i].children().eq(j).find('img').eq(0), // élément image de la maquette
                        navFormatLi = $("<li></li>"), // ulNav3 suite
                        navFormatLiA = $("<a href='#' ></a>"), // ulNav3 suite
                        classeFormatSlide,
                        classeFormatNav;

                    // Ajoute la bonne classe à l'élément (classe selon le format de la maquette), priorité au data-format, sinon, on utilise
                    switch (slideImg.attr('data-format')) {
                    case 'desktop':
                        classeFormatSlide = classes.slideDesktopClass;
                        classeFormatNav = classes.navDesktopClass;
                        break;
                    case 'tablette':
                        classeFormatSlide = classes.slideTabletteClass;
                        classeFormatNav = classes.navTabletteClass;
                        break;
                    case 'mobile':
                        classeFormatSlide = classes.slideMobileClass;
                        classeFormatNav = classes.navMobileClass;
                        break;
                    default:
                        if (settings.maquetteSizeOrder[k] == 'desktop') {
                            classeFormatSlide = classes.slideDesktopClass;
                            classeFormatNav = classes.navDesktopClass;
                        } else if (settings.maquetteSizeOrder[k] == 'tablette') {
                            classeFormatSlide = classes.slideTabletteClass;
                            classeFormatNav = classes.navTabletteClass;
                        } else if (settings.maquetteSizeOrder[k] == 'mobile') {
                            classeFormatSlide = classes.slideMobileClass;
                            classeFormatNav = classes.navMobileClass;
                        }
                        break;
                    }
                    slideFormatLi.toggleClass(classes.singleSlideClass + ' ' + classeFormatSlide, true);
                    navFormatLi.toggleClass(classes.navSlideClass + ' ' + classeFormatNav, true);

                    // Intègre le bon texte dans le menu (nom des pages)
                    var navFormatLiATxt = slideImg.attr('data-format');
                    if (navFormatLiATxt == "" || navFormatLiATxt == undefined)
                        navFormatLiATxt = settings.maquetteSizeOrder[k];

                    navFormatLiA.text(navFormatLiATxt).attr('href', navPageLiA.attr('href') + '&format=' + k);

                    // Ajoute les éléments à la page
                    slidePageUl.append(slideFormatLi.append(slideFormatDiv.append(slideFormatDiv2.append(slideImg))));
                    navPageUl.append(navFormatLi.append(navFormatLiA));
                }
            }
        }

        // Retourne la concaténation de tous les éléments de la section slider
        return sectionSlider;
    };

    /* ========== 5.2 - Associe les bon styles de couleurs aux éléments ========== */
    function sliderNavColors(settings, classes) {

        // background = backgroundColor
        $('.' + classes.navClass + ', .' + classes.navSlideClass + ' > a').css({
            backgroundColor: settings.colors.backgroundColor
        });

        // color = textColor
        $('.' + classes.navAuteurClass + ' > a, .' + classes.navPageIntroClass + ' > a, .' + classes.navPageClass + ' > a, .' + classes.navSlideClass + ' > a').css({
            color: settings.colors.textColor
        });

        // color = backgroundColor
        $('.' + classes.navPageClass + ' > a').css({
            color: settings.colors.backgroundColor
        });

        // background = highlightColor
        $('.' + classes.navPageClass + ' > a').css({
            backgroundColor: settings.colors.highlightColor
        });

        // border-bottom = highlightColor
        $('.' + classes.navClass).css({
            borderBottomColor: settings.colors.highlightColor
        });

        // hover class type 1
        $('.' + classes.navSlideClass + '' + ', .' + classes.navPageIntroClass + ', .' + classes.navAuteurClass).hover(
            function () {
                $(this).children().css({
                    color: settings.colors.backgroundColor,
                    backgroundColor: settings.colors.highlightColor
                });
            },
            function () {
                $(this).children().css({
                    color: settings.colors.textColor,
                    backgroundColor: settings.colors.backgroundColor
                });
            }
        );

        // hover class type 2
        $('.' + classes.navPageClass).hover(
            function () {
                $(this).children().css({
                    color: settings.colors.textColor,
                    backgroundColor: settings.colors.backgroundColor
                });
            },
            function () {
                $(this).children().css({
                    color: settings.colors.backgroundColor,
                    backgroundColor: settings.colors.highlightColor
                });
            }
        );

        // Background-images
        var mockupColor = "white";
        if (settings.useBlackFrame) {
            mockupColor = "black";
        }

        $('.' + classes.slideTabletteClass).css({
            backgroundImage: 'url("../superPatate/img/ipad-mockup-' + mockupColor + '.png")',
        })
        $('.' + classes.slideMobileClass).css({
            backgroundImage: 'url("../superPatate/img/iphone-mockup-' + mockupColor + '.png")'
        })
    };

    /* ========== 5.3 - Fontion pour gérer le resize de certains élément sur le resize de la fenêtre ========== */
    function onWindowResize(classes) {
        // 5.3.1 - Fix pour le slider (prendre en compte la hauteur du menu mais quand même display la page en 100% -> 100% heuteur - hauteurNav)
        $('.' + classes.slideDesktopClass + ' > div').css({
            height: $(window).height() - 46 + 'px'
        });
        //5.3.2 - Calcule la largeur des slides pour avoir les maquettes côte à côte
        $('.' + classes.slidePageClass + ' > ul').css('width', $(window).width() * 3 + 'px');
        $('.' + classes.singleSlideClass).css('width', $(window).width() + 'px');
        // 5.3.3 - Repositionne le slider vis-à-vis la bonne maquette
        gererEvSlide(classes);
    };


    /* ===============================================================================================
     * ========== 6.0 - Déclaration de la fonction pour gérer les événements pour les slide ==========
     * ============================================================================================ */

    /* PARAM:
     * classes = référence à $.fn.superPatate.classes
     */
    function gererEvSlide(classes) {
        var auteurId = getParamGET('auteur'),
            pageId = getParamGET('page'),
            formatId = getParamGET('format'),
            sectionName = getParamGET('section');

        if (sectionName == 'slider') {
            // Affiche/Cache les sections
            $('.' + classes.sliderClass).css('display', 'block');
            $('.' + classes.introClass).css('display', 'none');

            // Assigne les valeurs par défaut aux ids
            if (auteurId == null || auteurId == "")
                auteurId = 0;
            if (pageId == null || pageId == "")
                pageId = 0;
            if (formatId == null || formatId == "")
                formatId = 0;

            // Affiche le bon auteur
            $('.' + classes.slideAuteurClass).css('display', 'none');
            $('.' + classes.slideAuteurClass).eq(auteurId).css('display', 'block');

            // Affiche la bonne page
            $('.' + classes.slidePageClass).css('display', 'none');
            $('.' + classes.slideAuteurClass).eq(auteurId).find('.' + classes.slidePageClass).eq(pageId).css('display', 'block');
            
            

            // affiche le bon format et Détermine la bonne hauteur pour la slide (ex: si le mockup est plus grand que la fenêtre du navigateur, ajouter de l'espace en dessous pour faire plus aéré, etc.)
            var height = 0,
                mockup = $('.' + classes.slideAuteurClass).eq(auteurId).find('.' + classes.slidePageClass).eq(pageId).children('ul').children('li').eq(formatId).children('div');
            if ($(window).height() >= mockup.height)
                height = $(window).height();
            else {
                height = 42 /* hauteur du menu */ + 150 /* margin-top */ + mockup.height() /* mockup height */ + 200 /* margin-bottom */ ;
                if (mockup.parent().hasClass(classes.slideDesktopClass))
                    height -= (200 + 150 + 42); // pas de margin pour la slide Desktop
            }
            $('.' + classes.slideAuteurClass).eq(auteurId).css('height', height + 'px');
            $('.' + classes.slideAuteurClass).eq(auteurId).find('.' + classes.slidePageClass).eq(pageId).children('ul').css('left', formatId * $(window).width() * -1);
        } else {
            // page intro par défaut si elle existe
            if ($('.' + classes.introClass).length > 0) {
                $('.' + classes.sliderClass).css('display', 'none');
                $('.' + classes.introClass).css('display', 'block');
            } else {
                // Sinon quoi? nothing? maybe...
            }
        }
    };

    // Fonction pour aller cherche la valeur du paramètre GET ayant le nom "name" (option passée en paramètre)
    function getParamGET(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        } else {
            return results[1] || 'test';
        }
    };

}(jQuery));