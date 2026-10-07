package com.uyghur.ai.platform;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.content.FileProvider;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {

    public class AndroidBridge {
        private Context mContext;

        public AndroidBridge(Context context) {
            this.mContext = context;
        }

        @JavascriptInterface
        public void installApk(String url) {
            startDownloadAndInstall(url);
        }
    }

    private void startDownloadAndInstall(String url) {
        try {
            String filename = "uyghur-ai-update.apk";
            try {
                if (url != null && url.contains("/")) {
                    String part = url.substring(url.lastIndexOf('/') + 1);
                    if (part.endsWith(".apk")) {
                        filename = part;
                    }
                }
            } catch (Exception ignored) {}

            final String finalFilename = filename;
            DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
            Uri uri = Uri.parse(url);
            DownloadManager.Request request = new DownloadManager.Request(uri);
            request.setMimeType("application/vnd.android.package-archive");
            request.setTitle("Uyghur AI");
            request.setDescription("ئەپ يېڭى نەشرى قاچىلىنىۋاتىدۇ...");
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, finalFilename);
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);

            final long downloadId = dm.enqueue(request);

            BroadcastReceiver receiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    try {
                        long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                        if (id == downloadId) {
                            File file = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), finalFilename);
                            if (file.exists()) {
                                Intent promptInstall = new Intent(Intent.ACTION_VIEW);
                                Uri apkUri;
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                                    apkUri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", file);
                                    promptInstall.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                } else {
                                    apkUri = Uri.fromFile(file);
                                }
                                promptInstall.setDataAndType(apkUri, "application/vnd.android.package-archive");
                                promptInstall.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                                startActivity(promptInstall);
                            }
                        }
                    } catch (Exception ignored) {}
                }
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED);
            } else {
                registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
            }
        } catch (Exception e) {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(Uri.parse(url), "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
                webView.setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                        if (url != null && url.contains(".apk")) {
                            startDownloadAndInstall(url);
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
