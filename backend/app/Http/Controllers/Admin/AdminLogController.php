<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SystemLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminLogController extends Controller
{
    /**
     * List paginated audit logs.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);

        $logs = AuditLog::with('user:id,name,email,role')
            ->latest()
            ->paginate($perPage);

        return response()->json($logs);
    }

    /**
     * List paginated system logs with sensitive information masked.
     */
    public function systemLogs(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);

        $logs = SystemLog::latest()->paginate($perPage);

        // Sanitize and mask any accidental sensitive entries
        $logs->getCollection()->transform(function (SystemLog $log) {
            if (is_array($log->context)) {
                $sanitizedContext = [];
                foreach ($log->context as $k => $v) {
                    if (preg_match('/(key|secret|password|token|auth)/i', (string) $k)) {
                        $sanitizedContext[$k] = '••••••••';
                    } else {
                        $sanitizedContext[$k] = $v;
                    }
                }
                $log->context = $sanitizedContext;
            }
            return $log;
        });

        return response()->json($logs);
    }
}
