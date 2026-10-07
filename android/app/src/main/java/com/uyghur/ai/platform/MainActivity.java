package com.uyghur.ai.platform;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends BridgeActivity {

    private final ExecutorService mExecutor = Executors.newSingleThreadExecutor();
    private boolean mPendingInstall = false;

    public class AndroidBridge {
        private final Context mContext;

        public AndroidBridge(Context context) {
            this.mContext = context;
        }

        @JavascriptInterface
        public int getNativeVersionCode() {
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    return (int) pInfo.getLongVersionCode();
                } else {
                    return pInfo.versionCode;
                }
            } catch (Exception e) {
                return 100;
            }
        }

        @JavascriptInterface
        public String getNativeVersionName() {
            try {
                PackageInfo pInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                return pInfo.versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        @JavascriptInterface
        public boolean canInstallPackages() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                return getPackageManager().canRequestPackageInstalls();
            }
            return true;
        }

        @JavascriptInterface
        public void openInstallPermissionSettings() {
            runOnUiThread(() -> {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                        intent.setData(Uri.parse("package:" + getPackageName()));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    }
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "تەڭشەكنى ئاچالمىدى: " + e.getMessage(), Toast.LENGTH_LONG).show();
                }
            });
        }

        @JavascriptInterface
        public void startNativeDownload(String url) {
            downloadApkFileReal(url);
        }

        @JavascriptInterface
        public void installDownloadedApk() {
            launchPackageInstaller();
        }

        @JavascriptInterface
        public void installApk(String url) {
            File apk = getApkFile();
            if (apk.exists() && apk.length() > 5000000) {
                launchPackageInstaller();
            } else {
                downloadApkFileReal(url);
            }
        }
    }

    private File getApkFile() {
        File dir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
        if (dir == null) {
            dir = getFilesDir();
        }
        return new File(dir, "uyghur-ai-update.apk");
    }

    private void notifyJs(String jsCode) {
        runOnUiThread(() -> {
            try {
                WebView wv = getBridge() != null ? getBridge().getWebView() : null;
                if (wv != null) {
                    wv.evaluateJavascript(jsCode, null);
                }
            } catch (Exception ignored) {}
        });
    }

    private void downloadApkFileReal(String downloadUrl) {
        mExecutor.execute(() -> {
            HttpURLConnection conn = null;
            InputStream in = null;
            FileOutputStream out = null;
            try {
                URL url = new URL(downloadUrl);
                int redirects = 0;
                while (redirects < 8) {
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android) UyghurAIApp/1.0.3");
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(30000);
                    conn.setInstanceFollowRedirects(true);
                    int status = conn.getResponseCode();
                    if (status == HttpURLConnection.HTTP_MOVED_TEMP ||
                        status == HttpURLConnection.HTTP_MOVED_PERM ||
                        status == HttpURLConnection.HTTP_SEE_OTHER ||
                        status == 307 || status == 308) {
                        String newUrl = conn.getHeaderField("Location");
                        url = new URL(newUrl);
                        redirects++;
                    } else if (status == HttpURLConnection.HTTP_OK) {
                        break;
                    } else {
                        throw new Exception("تور ئۇلىنىش خاتالىقى (HTTP " + status + ")");
                    }
                }

                long totalLength = conn.getContentLengthLong();
                if (totalLength <= 0) {
                    totalLength = 11611445L; // Fallback to known APK size
                }

                File apkFile = getApkFile();
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                in = conn.getInputStream();
                out = new FileOutputStream(apkFile);
                byte[] buffer = new byte[16384];
                long totalBytes = 0;
                int read;
                long lastUpdate = 0;

                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    totalBytes += read;

                    long now = System.currentTimeMillis();
                    if (now - lastUpdate > 120 || totalBytes >= totalLength) {
                        lastUpdate = now;
                        int percent = (int) Math.min(100, (totalBytes * 100) / totalLength);
                        double currentMb = totalBytes / (1024.0 * 1024.0);
                        double totalMb = totalLength / (1024.0 * 1024.0);
                        String mbText = String.format(Locale.US, "%.1f MB / %.1f MB", currentMb, totalMb);

                        String js = String.format(Locale.US,
                            "window.onNativeDownloadProgress && window.onNativeDownloadProgress(%d, '%s', %d, %d);",
                            percent, mbText, totalBytes, totalLength);
                        notifyJs(js);
                    }
                }
                out.flush();

                notifyJs("window.onNativeDownloadComplete && window.onNativeDownloadComplete();");

            } catch (Exception e) {
                String errMsg = e.getMessage() != null ? e.getMessage() : "چۈشۈرۈش مەغلۇپ بولدى";
                notifyJs("window.onNativeDownloadError && window.onNativeDownloadError('" + errMsg.replace("'", "\\'") + "');");
            } finally {
                try { if (in != null) in.close(); } catch (Exception ignored) {}
                try { if (out != null) out.close(); } catch (Exception ignored) {}
                try { if (conn != null) conn.disconnect(); } catch (Exception ignored) {}
            }
        });
    }

    private void launchPackageInstaller() {
        runOnUiThread(() -> {
            try {
                File apkFile = getApkFile();
                if (!apkFile.exists() || apkFile.length() < 1000000) {
                    Toast.makeText(MainActivity.this, "APK ھۆججىتى تېپىلمىدى ياكى تولۇق چۈشمىدى", Toast.LENGTH_SHORT).show();
                    notifyJs("window.onNativeDownloadError && window.onNativeDownloadError('APK ھۆججىتى تولۇق ئەمەس');");
                    return;
                }

                // Check Unknown Sources permission for Android 8.0+
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    if (!getPackageManager().canRequestPackageInstalls()) {
                        mPendingInstall = true;
                        Toast.makeText(MainActivity.this, "ئەپنى يېڭىلاش ئۈچۈن قاچىلاشقا رۇخسەت بېرىڭ", Toast.LENGTH_LONG).show();
                        Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                        settingsIntent.setData(Uri.parse("package:" + getPackageName()));
                        settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(settingsIntent);

                        notifyJs("window.onNativeRequirePermission && window.onNativeRequirePermission();");
                        return;
                    }
                }

                Uri apkUri = FileProvider.getUriForFile(
                    MainActivity.this,
                    getPackageName() + ".fileprovider",
                    apkFile
                );

                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(installIntent);

            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "قاچىلاش مەغلۇپ بولدى: " + e.getMessage(), Toast.LENGTH_LONG).show();
                notifyJs("window.onNativeDownloadError && window.onNativeDownloadError('" + e.getMessage() + "');");
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        if (mPendingInstall) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (getPackageManager().canRequestPackageInstalls()) {
                    mPendingInstall = false;
                    launchPackageInstaller();
                }
            }
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = getBridge() != null ? getBridge().getWebView() : null;
            if (webView != null) {
                webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
                webView.setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                        if (url != null && url.contains(".apk")) {
                            downloadApkFileReal(url);
                        } else {
                            try {
                                Intent i = new Intent(Intent.ACTION_VIEW);
                                i.setData(Uri.parse(url));
                                startActivity(i);
                            } catch (Exception ignored) {}
                        }
                    }
                });
            }
        } catch (Exception ignored) {}
    }
}
