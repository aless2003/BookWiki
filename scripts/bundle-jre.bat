@echo off
set MODULES=java.base,java.compiler,java.desktop,java.instrument,java.management,java.naming,java.prefs,java.rmi,java.scripting,java.security.jgss,java.sql,java.xml,jdk.httpserver,jdk.unsupported,jdk.crypto.ec,jdk.management,java.net.http
set JMODS="C:\Program Files\BellSoft\LibericaJDK-25-Full\jmods"

echo Building minimal JRE with modules: %MODULES%

if exist "dist\jre" (
    echo Removing old JRE...
    rmdir /s /q "dist\jre"
)

if not exist "dist" mkdir "dist"

jlink ^
    --module-path %JMODS% ^
    --add-modules %MODULES% ^
    --strip-debug ^
    --no-man-pages ^
    --no-header-files ^
    --compress zip-9 ^
    --output dist\jre

echo JRE built successfully in dist\jre
