:: 1) Build game client source code
"C:\\ProgramData\\cocos\\editors\\Creator\\3.8.0\\CocosCreator.exe" --project . --build platform=web-mobile;debug=false;webOrientation=landscape;md5Cache=true;replaceSplashScreen=true
:: 2) Transform config and build game client image
del "./build/web-mobile/c/c.js" /y
(
echo window.envConfig = {
echo     isDev: false,
echo     systemType: "SC1",
echo     ssl: false,
echo     serverDomainMapper: {
echo         localhost: "localhost:9998",
echo     },
echo     subDomain: "",
echo     env: "LOCAL",
echo     subGuideDomain: "l1-guide",
echo     enableMsgpackParserAllGames: false,
echo     enableMsgpackParserOnNotification: false,
echo     userServiceUrlDev: "http://localhost:9998/",
echo     proxyRoute: "",
echo     websocket: {
echo        proxyPath: "spaceflight",
echo        route: "",
echo    },
echo };
) > ./build/web-mobile/c/c.js
:: 3) Build game client image
docker rmi game-client-integration-test:latest -f
docker build -t game-client-integration-test -f ../integration.dockerfile ..
:: 4) Run game client container
docker rm dev-integration-test-container -f
docker run -d -p "9999:80" --name dev-integration-test-container -v "%cd%/build/web-mobile/:/usr/share/nginx/html" game-client-integration-test:latest
:: 5) Run stub service container
docker pull hub.lumigame.com/pentagon/game-clients/stub-service:LOCAL-latest
docker rm local-integration-stub-service -f & docker run -d -p "9998:8080" -v "%cd%/tests/integration-tests/data:/builds/tests/integration-tests" --env NAMESPACES="/,/user/spaceflight" --name local-integration-stub-service hub.lumigame.com/pentagon/game-clients/stub-service:LOCAL-latest
