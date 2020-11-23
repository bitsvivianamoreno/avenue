(() => {
    let app = angular.module('bavariaApp', []);

    app.config(function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    });

    app.controller('bavariaCtrl', ['$scope', '$http', '$window', ($scope, $http, $window) => {
        $scope.menuResponsive = false;
        $scope.tabSelect = false;
        $scope.showAgeGate = 'false';
        // variable puja cerrada
        $scope.auctionEnded = false;

        if (location.href.match("subasta-por-las-comunidades-afrodescendientes")) {

            if (location.href.match("subasta-por-las-comunidades-afrodescendientes/compra")) {
                $scope.data = drupalSettings.bits_mercadopago;
                if ($scope.data.user) {
                    localStorage.setItem("btns_session", true);
                }
            }

            if (localStorage.getItem("btns_session") === 'false') {
                // $window.location.href = window.location.origin;
            }
            if (localStorage.getItem("btns_session") === 'true') {

            }
            if (localStorage.getItem("btns_session") === null) {
                // $window.location.href = window.location.origin;
            }
        }

        if (localStorage.getItem("age_gate_remember")) {
            $scope.showAgeGate = 'false';

        } else {
            $scope.showAgeGate = 'true';
        }

        if (localStorage.getItem('btns_session') == 'null' ||
            localStorage.getItem('btns_session') == null ||
            localStorage.getItem('btns_session') == undefined || localStorage.getItem('btns_session') == 'undefined') {
            localStorage.setItem("btns_session", false);
        }
        $scope.btns_session = localStorage.getItem('btns_session');

        $scope.actMenuResponsive = () => {
            $scope.menuResponsive = !$scope.menuResponsive;
        }

        $scope.changeTabs = (value) => {
            if (value === 'register') {
                $scope.tabSelect = false;
            } else {
                $scope.tabSelect = true;
            }
        }

        $scope.updatePage = () => {
            location.reload();
        }

        /* Active SubMenu */
        let itemMenu = document.querySelector(`.menu-item--expanded > a`);
        let subMenuShow = false;

        if (itemMenu) {
            itemMenu.addEventListener("click", () => {

                let submenu = document.querySelector(`.menu-item--expanded .menu-active`);
                subMenuShow = !subMenuShow;

                if (subMenuShow) {
                    submenu.classList.add('show-block');
                } else {
                    submenu.classList.remove('show-block');
                }

                let subMenuBox = document.querySelector(`.menu-item--expanded .menu-active > .menu`);
                subMenuBox.classList.add('container');

            });

            /* Active Responsive */
            let itemMenuResp = document.querySelector(`.menu-responsive .menu-item--expanded > a`);
            let subMenuShowRes = false;
            itemMenuResp.addEventListener("click", () => {

                let submenu = document.querySelector(`.menu-responsive .menu-item--expanded .menu-active`);
                subMenuShowRes = !subMenuShowRes;

                if (subMenuShowRes) {
                    submenu.classList.add('show-block');
                } else {
                    submenu.classList.remove('show-block');
                }

                let subMenuBox = document.querySelector(`.menu-responsive .menu-item--expanded .menu-active > .menu`);
                subMenuBox.classList.add('container');

            });
        }
        /* Formulario Register */
        $scope.regexEmailEdit = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9_-]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}';
        $scope.regexText = '[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+';
        $scope.regexNumb = '[0-9+]+';
        $scope.formRegisterData = {};
        $scope.loading = false;
        $scope.errorModal = false;

        $scope.register = e => {
            $scope.errorModal = false;
            $scope.loading = true;
            jQuery('#modalRegister').modal('show');

            $http.get('/rest/session/token').then(function(resp) {

                let data_post = {
                    name: [
                        { value: $scope.formRegisterData.useremail }
                    ],
                    mail: [
                        { value: $scope.formRegisterData.useremail }
                    ],
                    pass: [
                        { value: $scope.formRegisterData.userpassword }
                    ],
                    field_user_fullname: [
                        { value: $scope.formRegisterData.username }
                    ],
                    field_user_identification: [
                        { value: $scope.formRegisterData.identification }
                    ],
                    field_user_phone: [
                        { value: $scope.formRegisterData.phone }
                    ],
                    field_user_gender: [
                        { value: $scope.formRegisterData.gender }
                    ],
                    field_user_accept_terms: [
                        { value: $scope.formRegisterData.terms }
                    ],
                    field_user_accept_data_policies: [
                        { value: $scope.formRegisterData.politics }
                    ]
                };

                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: data_post,
                    url: `/api/user/register`
                }).then(function successCallback(response) {
                    $scope.loading = false;

                    // Throw event.
                    dataLayer.push({
                        'event': 'trackEvent',
                        'eventCategory': 'dia de la raza',
                        'eventAction': 'registrate home',
                        'eventLabel': Drupal.behaviors.SHA256.sha256($scope.formRegisterData.useremail),
                    });
                    fbq('track', 'CompleteRegistration');
                    $scope.sendTD(
                        $scope.formRegisterData.politics, {
                            abi_name: $scope.formRegisterData.username,
                            abi_phone: $scope.formRegisterData.phone,
                            abi_email: $scope.formRegisterData.useremail,
                            abi_gender: $scope.formRegisterData.gender,
                            td_client_id: response.data.account.uuid[0].value
                        });

                    if (response.data.code === 200) {
                        jQuery('#modalRegister').modal('hide');
                        localStorage.setItem("btns_session", true);
                        $scope.loading = false;
                        $scope.formLoginData = {};
                        $window.location.href = response.data.url_redirect;
                    } else {
                        $scope.loading = false;
                        $scope.modalRegisterClass = 'alert alert-danger'
                        $scope.modalTitleRegister = 'Inicio de sesión fallido';
                        $scope.modalDescriptionRegister = 'Credenciales inválidas!!';
                        $scope.formLoginData = {};
                        $scope.errorModal = true;
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                    $scope.modalRegisterClass = 'alert alert-danger'
                    $scope.modalTitleRegister = 'Regístro fallido';
                    $scope.modalDescriptionRegister = 'El correo introducido ya existe!!';
                    $scope.formRegisterData = {};

                });
            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
                $scope.modalRegisterClass = 'alert alert-danger'
                $scope.modalTitleRegister = 'Regístro fallido';
                $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                $scope.formRegisterData = {};

            });
        };

        /* Formulario Login */
        $scope.formLoginData = {};
        $scope.passRecovery = false;

        $scope.showPassRecovery = () => {
            $scope.passRecovery = !$scope.passRecovery;
        }

        $scope.login = () => {
            $scope.errorModal = false;
            $scope.loading = true;
            jQuery('#modalRegister').modal('show');

            $http.get('/rest/session/token').then(function(resp) {

                let data_post = {
                    name: $scope.formLoginData.email,
                    pass: $scope.formLoginData.password
                };

                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: data_post,
                    url: `/api/user/login`
                }).then(function successCallback(response) {
                    if (response.data.code === 200) {
                        jQuery('#modalRegister').modal('hide');
                        // Throw event. TODO: Agregar al success.
                        dataLayer.push({
                            'event': 'trackEvent',
                            'eventCategory': 'dia de la raza',
                            'eventAction': 'home',
                            'eventLabel': 'ingresar',
                        });
                        localStorage.setItem("btns_session", true);
                        $scope.loading = false;
                        $scope.formLoginData = {};
                        $window.location.href = response.data.url_redirect;
                    } else {
                        $scope.loading = false;
                        $scope.modalRegisterClass = 'alert alert-danger'
                        $scope.modalTitleRegister = 'Inicio de sesión fallido';
                        $scope.modalDescriptionRegister = 'Credenciales inválidas!!';
                        $scope.formLoginData = {};
                        $scope.errorModal = true;
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                    $scope.modalRegisterClass = 'alert alert-danger'
                    $scope.modalTitleRegister = 'Inicio de sesión fallido';
                    $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                    $scope.formLoginData = {};
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
                $scope.modalRegisterClass = 'alert alert-danger'
                $scope.modalTitleRegister = 'Inicio de sesión fallido';
                $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                $scope.formLoginData = {};

            });
        }
        $scope.formRecoveryData = {}
        $scope.recovery = () => {
            $scope.errorModal = false;
            $scope.loading = true;
            jQuery('#modalRegister').modal('show');

            $http.get('/rest/session/token').then(function(resp) {

                let data_post = {
                    email: $scope.formRecoveryData.email,
                };

                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: data_post,
                    url: `/api/user/recovery`
                }).then(function successCallback(response) {

                    $scope.loading = false;

                    if (response.data.token === 200) {
                        $scope.modalRegisterClass = 'alert alert-bavaria'
                        $scope.modalTitleRegister = 'Correo enviado';
                        $scope.modalDescriptionRegister = 'Recibiras un correo para el cambio de contraseña';
                        $scope.formRegisterData = {};
                    } else {
                        $scope.modalRegisterClass = 'alert alert-danger'
                        $scope.modalTitleRegister = 'Credenciales inválidas';
                        $scope.modalDescriptionRegister = 'Correo no exíste';
                        $scope.formRecoveryData = {};
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                    $scope.modalRegisterClass = 'alert alert-danger'
                    $scope.modalTitleRegister = 'Error';
                    $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                    $scope.formRecoveryData = {};
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
                $scope.modalRegisterClass = 'alert alert-danger'
                $scope.modalTitleRegister = 'Inicio de sesión fallido';
                $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                $scope.formLoginData = {};

            });
        }

        $scope.formPasswordRecoveryData = {}
        $scope.passwordRecorvery = true;
        $scope.recoveryPassword = () => {
            $scope.errorModal = false;
            $scope.loading = true;
            jQuery('#modalRegister').modal('show');

            $http.get('/rest/session/token').then(function(resp) {
                const token = document.getElementById('token').value;
                let data_post = {
                    token: token,
                    pass: $scope.formPasswordRecoveryData.password,
                    confirm_pass: $scope.formPasswordRecoveryData.password_confirm,
                };

                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: data_post,
                    url: `/api/user/recovery/account`
                }).then(function successCallback(response) {

                    if (response.data.token === 200) {
                        jQuery('#modalRegister').modal('hide');
                        $scope.passwordRecorvery = false;
                        $scope.formPasswordRecoveryData = {};
                    } else {
                        $scope.loading = false;
                        $scope.modalRegisterClass = 'alert alert-danger'
                        $scope.modalTitleRegister = 'Credenciales inválidas';
                        $scope.modalDescriptionRegister = 'Correo no exíste';
                        $scope.formPasswordRecoveryData = {};
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                    $scope.modalRegisterClass = 'alert alert-danger'
                    $scope.modalTitleRegister = 'Inicio de sesión fallido';
                    $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                    $scope.formPasswordRecoveryData = {};
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
                $scope.modalRegisterClass = 'alert alert-danger'
                $scope.modalTitleRegister = 'Inicio de sesión fallido';
                $scope.modalDescriptionRegister = 'Ha ocurrido un error inesperado!!';
                $scope.formPasswordRecoveryData = {};

            });
        }

        $scope.home = () => {
            $window.location.href = "https://www.cervezaaguila.com/";
        }
        $scope.home2 = () => {
            $window.location.href = window.location.origin;
        }

        $scope.logout = () => {
            localStorage.setItem("btns_session", 'false');
            setTimeout(() => {
                window.location.href = '/user/logout';
            }, 1000);
        }

        $scope.sendTD = (politics, form_data = []) => {
            $http.get('/rest/session/token').then(function(resp) {
                let data = {
                    marketing: politics,
                    form_data: form_data,
                    location: window.location.pathname
                };
                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: data,
                    url: '/api/cdp/send_td'
                }).then(function successCallback(response) {
                    console.log('TrackEvent', response.status);
                }, function errorCallback(response) {
                    console.log('TrackEventError:', response);
                });
            }, function errorCallback(response) {
                console.log('SessionTokenError:', response);
            });
        }

        /* TshirtCtrl */
        $scope.mountInit = '';
        $scope.inputMultiple = false;
        $scope.inputMultipleMin = false;
        $scope.tshirt = [];
        $scope.numbersPages = 1;
        $scope.pagerActive = 1;
        $scope.textSearch = '';
        $scope.urlImg = 'https://jmva.or.jp/wp-content/uploads/2018/07/noimage.png';

        $scope.getShirts = () => {
            $scope.loading = true;
            $scope.tshirt = [];
            $scope.numbersPages = 1;
            $scope.pagerActive = 1;

            $http.get('/rest/session/token').then(function(resp) {

                $http({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    url: `/api/auction-get-tshirt-rest-resource`
                }).then(function successCallback(response) {
                    $scope.loading = false;
                    jQuery('html, body').animate({ scrollTop: 0 }, 'slow');

                    if (response.status === 200) {
                        $scope.uid = response.data.uid;
                        $scope.tshirt = response.data.data;
                        $scope.auctionEnded = response.data.auctionEnd;
                        console.log($scope.auctionEnded);
                        /* Paginacion */
                        $scope.numbersPages = new Array(response.data.pages);
                        for (let index = 0; index < $scope.numbersPages.length; index++) {
                            $scope.numbersPages[index] = index + 1;
                        }
                    } else {
                        console.log(response.data);
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
            });
        }

        $scope.nextPage = number => {
            $scope.loading = true;
            $scope.tshirt = [];
            $scope.numbersPages = 1;
            $scope.pagerActive = number;

            $http.get('/rest/session/token').then(function(resp) {
                $scope.loading = true;

                $http({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    url: `/api/auction-get-tshirt-rest-resource?pager=${number}?name=${$scope.textSearch}`
                }).then(function successCallback(response) {
                    $scope.loading = false;

                    jQuery('html, body').animate({ scrollTop: 0 }, 'slow');

                    if (response.status === 200) {
                        $scope.tshirt = response.data.data;
                        $scope.auctionEnded = response.data.auctionEnd;
                        console.log($scope.auctionEnded);
                        /* Paginacion */
                        $scope.numbersPages = new Array(response.data.pages);
                        for (let index = 0; index < $scope.numbersPages.length; index++) {
                            $scope.numbersPages[index] = index + 1;
                        }
                    } else {
                        console.log(response.data);
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
            });

        }

        $scope.searchShirt = () => {
            $scope.loading = true;
            $scope.tshirt = [];
            $scope.numbersPages = 1;
            $scope.pagerActive = 1;

            if ($scope.textSearch === '') {
                $scope.textSearch = '';
            } else {
                $scope.textSearch = $scope.textSearch.toLowerCase();
            }

            $http.get('/rest/session/token').then(function(resp) {

                $http({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    url: `/api/auction-get-tshirt-rest-resource?name=${$scope.textSearch}`
                }).then(function successCallback(response) {
                    $scope.loading = false;
                    jQuery('html, body').animate({ scrollTop: 0 }, 'slow');

                    if (response.status === 200) {
                        $scope.tshirt = response.data.data;
                        $scope.auctionEnded = response.data.auctionEnd;
                        console.log($scope.auctionEnded);

                        /* Paginacion */
                        $scope.numbersPages = new Array(response.data.pages);
                        for (let index = 0; index < $scope.numbersPages.length; index++) {
                            $scope.numbersPages[index] = index + 1;
                        }
                    } else {
                        console.log(response.data);
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
            });
        }

        $scope.sendOffer = (shirt) => {
            $scope.modalRegisterClass = 'alert alert-bavaria'
            $scope.modalTitle = '';
            $scope.modalSubTitle = '';
            $scope.mountPrice = '';
            $scope.modalDescription = '';
            let price = document.querySelector(`#price${shirt.nid}`).value;

            // TODO: Incluir valor de la variable que almacena nombre de camiseta
            // que está en subasta.
            dataLayer.push({
                'event': 'trackEvent',
                'eventCategory': 'dia de la raza',
                'eventAction': 'productos',
                'eventLabel': shirt.name,
            });
            fbq('track', 'ViewContent', {
                currency: 'COP',
                value: price,
                content_ids: shirt.nid,
                content_type: shirt.name,
            });

            $scope.loading = true;
            jQuery('#modalOffer').modal('show');

            $http.get('/rest/session/token').then(function(resp) {

                $http({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-Token': resp.data
                    },
                    data: null,
                    url: `/api/auction-bid-logic-rest-resource/${shirt.nid}/${$scope.uid}/${price}?_format=json`
                }).then(function successCallback(response) {
                    $scope.loading = false;

                    if (response.status === 200) {
                        $scope.modalRegisterClass = 'alert alert-bavaria'
                        $scope.modalTitle = 'TU OFERTA HA SIDO RECIBIDA';
                        $scope.modalSubTitle = 'TU OFERTA HA SIDO POR:';
                        $scope.mountPrice = price;
                        $scope.modalDescription = 'Si otra persona realiza una oferta mayor serás notificado y tendrás la oportunidad de ofertar nuevamente.';
                    } else {
                        $scope.modalTitle = 'HA OCURRIDO UN ERROR';
                        $scope.modalSubTitle = 'TU OFERTA NO PUDO SER PROCESADA';
                        $scope.mountPrice = price;
                        $scope.modalDescription = null;
                    }

                }, function errorCallback(response) {
                    $scope.loading = false;
                    console.log(response);
                    $scope.modalTitle = 'HA OCURRIDO UN ERROR';
                    $scope.modalSubTitle = 'TU OFERTA NO PUDO SER PROCESADA';
                    $scope.mountPrice = price;
                    $scope.modalDescription = null;
                });

            }, function errorCallback(response) {
                $scope.loading = false;
                console.log(response);
                $scope.modalTitle = 'HA OCURRIDO UN ERROR';
                $scope.modalSubTitle = 'TU OFERTA NO PUDO SER PROCESADA';
                $scope.mountPrice = price;
                $scope.modalDescription = null;
            });
        }

        $scope.showModalImg = (shirt) => {
            $scope.urlImg = shirt.image;
            $scope.altImg = shirt.alt;
            jQuery('#modalShowImg').modal('show');
        }

        $scope.multiple = (shirt) => {
            let number = Number(document.querySelector(`#price${shirt.nid}`).value);
            $scope.shirtSelect = shirt.nid;
            $scope.inputMultipleMin = false;

            if (number) {
                let remainder = number % 1000;
                if (remainder == 0) {
                    if (number <= shirt.price) {
                        $scope.inputMultiple = false;
                        $scope.inputMultipleMin = true;
                        return;
                    }
                    $scope.inputMultipleMin = false;
                    $scope.inputMultiple = false;
                } else {
                    $scope.inputMultiple = true;
                }
            }

        }

        $scope.getShirts();

        $scope.searchBlank = () => {
            if ($scope.textSearch === '') {
                $scope.getShirts();
            } else {
                return;
            }
        }

        /* Age Gate */
        $scope.formDataAgeGate = {};
        $scope.validAgeGate = () => {
            let fecha = new Date();
            let year = fecha.getFullYear();

            if ((Number(year) - Number($scope.formDataAgeGate.year)) >= 18) {
                if ($scope.formDataAgeGate.remember) {
                    localStorage.setItem("age_gate_remember", true);
                } else {
                    localStorage.setItem("age_gate_remember", false);
                }
                $scope.showAgeGate = 'false';
            } else {
                $window.location.href = 'https://www.tapintoyourbeer.com/agegate?destination=age_check.cfm';
            }
        }

        if (document.getElementById("formPago")) {

            var checkbox = document.getElementById('terminos');
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    $scope.terminos = 1;
                } else {
                    $scope.terminos = 0;
                }
            });
            var checkbox = document.getElementById('politicas');
            $scope.politicas = 0;
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    $scope.politicas = 1;
                } else {
                    $scope.politicas = 0;
                }
            });


            $scope.data = drupalSettings.bits_mercadopago;
            $scope.price = $scope.data.price;
            $scope.tshirt2 = $scope.data.tshirt;
            $scope.fullname = $scope.data.user.fullname;
            $scope.email = $scope.data.user.email;
            $scope.identification = $scope.data.user.identification;
            $scope.phone = $scope.data.user.phone;
            $scope.city = '';
            $scope.address = '';
            $scope.datail = '';
            $scope.preference_id = $scope.data.preferenceId;

            $scope.step1 = false;
            $scope.step2 = false;
            $scope.step3 = false;

            if ($scope.data.step == 1) {
                $scope.step1 = true;
            }
            if ($scope.data.step == 2) {
                $scope.step2 = true;
            }
            if ($scope.data.step == 3) {
                $scope.step3 = true;
            }
            if ($scope.preference_id != 0) {
                let data_obj = JSON.parse(localStorage.getItem('data_send_cdp'));
                // Throw event.
                dataLayer.push({
                    'event': 'trackEvent',
                    'eventCategory': 'aguila subasta',
                    'eventAction': 'pago',
                    'eventLabel': Drupal.behaviors.SHA256.sha256(data_obj.email),
                });
                // CDP track
                $scope.sendTD(
                    data_obj.politicas, {
                        abi_name: data_obj.name,
                        abi_cpf: data_obj.identification,
                        abi_email: data_obj.email,
                        abi_phone: data_obj.phone,
                        abi_country: 'col', // Fijado a Colombia no existe en el form.
                        abi_city: data_obj.city,
                        abi_address: data_obj.address,
                        abi_campaign: 'AGUILA_SUBASTA_PAGO',
                        abi_form: 'AGUILA_SUBASTA_PAGO',
                        td_client_id: $scope.data.user.uuid,
                    });
                localStorage.removeItem('data_send_cdp');
            }
        }
        $scope.sendform = () => {
            $scope.name = $scope.fullname;
            $scope.identification2 = $scope.identification;
            $scope.email2 = $scope.email;
            $scope.phone2 = $scope.phone;
            $scope.city2 = $scope.city;
            $scope.datail2 = $scope.datail;
            $scope.terminos;
            $scope.politicas;
            $scope.tshirt2;
            $scope.address2 = $scope.address;

            $scope.dataUrl = '';
            $scope.dataUrl = `tshirt=${$scope.tshirt2}`;
            $scope.dataUrl += `&step=2`;
            $scope.dataUrl += `&fullname=${$scope.name}`;
            $scope.dataUrl += `&identification=${$scope.identification2}`;
            $scope.dataUrl += `&email=${$scope.email2}`;
            $scope.dataUrl += `&phone=${$scope.phone2}`;
            $scope.dataUrl += `&city=${$scope.city2}`;
            $scope.dataUrl += `&address=${$scope.address2}`;
            $scope.dataUrl += `&detail=${$scope.datail2}`;
            $scope.dataUrl += `&terminos=${$scope.terminos}`;
            $scope.dataUrl += `&politicas=${$scope.politicas}`;

            var urlPago = (window.location.origin + window.location.pathname + '?' + $scope.dataUrl);
            location.href = urlPago;

            // Save for CDP track
            localStorage.setItem('data_send_cdp', JSON.stringify({
                politicas: $scope.politicas,
                name: $scope.fullname,
                identification: $scope.identification,
                email: $scope.email,
                phone: $scope.phone,
                city: $scope.city,
                address: $scope.address,
            }));
        }
    }]);
})()
