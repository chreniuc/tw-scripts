(function ($) {
    function CoinsBot() {
        function init() {
            $(window).on('partial_reload_end', function () {
                mint();
            });
            Connection.handlers.gamedata = function (e) {
                TribalWars.handleGameData(e);
                if (typeof e.village !== 'undefined') {
                    console.log("Mint.");
					partialReload();
                }
            };
            Connection.socket.on('gamedata', function (e) {
                Connection.handlers.gamedata(e)
            });
            UI.SuccessMessage("Scriptul a fost pornit! Spor la taleri!");
            mint();
        }

        function mint() {
            if (isBotProtectionActive()) {
                return;
            }

            if (canMint()) {
                var $submit = $("#coin_mint_fill_max").click().next();
                var form = $($submit[0].form);
                var url = form.attr("action");
                var data = form.serialize();
                $.post(url, data, function () {
                    partialReload();
                });
            }
        }

        function canMint() {
            return $('#coin_mint_fill_max').length > 0;
        }

        function isBotProtectionActive() {
            if ($('.g-recaptcha').length > 0) {
                alert('ProtecÃ…Â£ie contra Bot-programe activÃ„Æ’! Scriptul a fost oprit Ãˆâ„¢i va fi repornit dupÃ„Æ’ verificare.');
                var interval = setInterval(function () {
                    if ($('.g-recaptcha').length === 0) {
                        clearInterval(interval);
                        UI.InfoMessage('Scriptul a fost repornit.');
                    } else {
                        console.log('Waiting for bot protection bypass...')
                    }
                }, 1000);

                return true;
            }

            return false;
        }

        init();
    }

    window.CoinsBot = CoinsBot();
})(jQuery);
