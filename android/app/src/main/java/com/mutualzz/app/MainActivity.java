package com.mutualzz.app;

import static android.provider.SyncStateContract.Helpers.update;

import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.view.ViewTreeObserver;
import android.webkit.WebView;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { /* no-op */ }
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            android.window.OnBackInvokedCallback cb = () -> { /* no-op */ };
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, cb
            );
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            final float EXCLUSION_DP = 12f; // tiny edge
            final int edgePx = (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP, EXCLUSION_DP, getResources().getDisplayMetrics()
            );

            final View v = getBridge().getWebView();

            final Runnable applyExclusion = () -> {
                int h = v.getHeight();
                int w = v.getWidth();
                if (h <= 0 || w <= 0) return;

                java.util.ArrayList<Rect> rects = new java.util.ArrayList<>();
                // Left-edge tiny strip; mirror for right if needed
                rects.add(new Rect(0, 0, edgePx, h));
                // rects.add(new Rect(w - edgePx, 0, w, h)); // right edge variant

                v.setSystemGestureExclusionRects(rects);
            };

            // Apply now and keep up-to-date on layout changes
            v.addOnLayoutChangeListener((view, l, t, r, b, ol, ot, or, ob) -> applyExclusion.run());
            ViewTreeObserver vto = v.getViewTreeObserver();
            vto.addOnGlobalLayoutListener(applyExclusion::run);
            v.post(applyExclusion);
        }
    }
}
