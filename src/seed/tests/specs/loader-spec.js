/**
 * test loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var d = window.location.href.replace(/[^/]*$/, "") + "../data/";

    function getStyle(elem, name) {
        if (document.defaultView) {
            return  document.defaultView.getComputedStyle(elem, null)[name];
        } else {
            return elem.currentStyle[name];
        }
    }

    describe("getStyle", function () {

        it("should callback after css onload", function () {

            var state = 0;

            expect(getStyle(document.getElementById("special"), "fontSize")).not.toBe("33px");

            S.getScript(d + "getStyle/fp2011.css", function () {
                setTimeout(function () {
                    expect(getStyle(document.getElementById("special"), "fontSize")).toBe("33px");
                    state++;
                    // breath
                }, 100);

            });

            // cross domain
            var d2 = d.replace("chengyu.taobao.ali.com", "yiminghe.taobao.ali.com");
            S.getScript(d2 + "getStyle/fp2011b.css", function () {
                setTimeout(function () {
                    expect(getStyle(document.getElementById("special2"), "fontSize")).toBe("44px");
                    state++;
                    // breath
                }, 100);
            });

            waitsFor(function () {
                return state == 2;
            }, 10000);
        });
    });

    describe("loader", function () {

        it("should load and attach custom mods correctly", function () {

            KISSY.config({
                packages: [
                    {
                        name: "1.2", //包名
                        tag: "20110323",
                        path: d //包对应路径，相对路径指相对于当前页面路径

                    }
                ]
            });

            new S.Node(document.body).append("<div id='k11x'/>");
            new S.Node(document.body).append("<div id='k12'/>");

            var ok = false;

            S.use("1.2/mod", function (S, Mod) {
                ok = true;
                expect(Mod).toBe(2);
                var mod12;
                var scripts = document.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    var script = scripts[i];
                    if (script.src.indexOf("1.2/mod.js") > -1) {
                        mod12 = script;
                        break;
                    }
                }

                expect(mod12.async).toBe(true);
                expect(mod12.charset).toBe("utf-8");
                expect(S.one("#k12").css("width")).toBe('111px');

            });

            waitsFor(function () {
                return ok;
            }, "1.2/mod never loaded");


        });

        it("detect cyclic dependency", function () {
            //return;
            var old = KISSY.Config.base;
            KISSY.config({
                packages: [
                    {
                        name: "cyclic",
                        path: "../others/loader/"
                    }
                ]

            });
            var oldError = S.error, err = [];

            S.error = function (args) {
                err.push(args);
                oldError(args[0]);
            };

            KISSY.use("cyclic/a");

            waitsFor(function () {
                if (err.length == 1) {
                    return err[0] == 'find cyclic dependency between mods: cyclic/a,cyclic/b,cyclic/c,cyclic/a';
                }
            }, 10000);

            runs(function () {
                S.error = oldError;
                KISSY.Config.base = old;
            });
        });

        it("map config works", function () {

            S.clearLoader();

            KISSY.config({
                packages: [
                    {
                        name: "1.2", //包名
                        tag: "20110323",
                        path: d //包对应路径，相对路径指相对于当前页面路径

                    }
                ],
                map: [
                    [/(.+)mod.js(.+)$/, "$1mod-min.js$2"]
                ]
            });

            var ok = 0;

            S.use("1.2/mod", function (S, Mod) {
                ok = 1;
                expect(Mod).toBe(999);
            });

            waitsFor(function () {
                return ok;
            }, "1.2/mod never loaded");

        });

    });


})(KISSY);

