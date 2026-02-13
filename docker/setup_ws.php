<?php
define('CLI_SCRIPT', true);
require('/opt/bitnami/moodle/config.php');

// Crear servicio externo
$service = new stdClass();
$service->name = 'mobile_app';
$service->shortname = 'mobile_app';
$service->enabled = 1;
$service->restrictedusers = 0;
$service->downloadfiles = 1;
$service->uploadfiles = 1;

$existing = $DB->get_record('external_services', array('shortname' => 'mobile_app'));
if ($existing) {
    $serviceid = $existing->id;
    echo "Servicio ya existe con ID: $serviceid\n";
} else {
    $serviceid = $DB->insert_record('external_services', $service);
    echo "Servicio creado con ID: $serviceid\n";
}

// Agregar funciones al servicio
$functions = array(
    'core_webservice_get_site_info',
    'core_enrol_get_users_courses',
    'core_course_get_contents',
    'core_user_get_users',
    'mod_assign_get_assignments',
    'mod_assign_get_submission_status',
    'mod_forum_get_forums_by_courses',
    'mod_forum_get_forum_discussions'
);

foreach ($functions as $fname) {
    $exists = $DB->record_exists('external_services_functions', array('externalserviceid' => $serviceid, 'functionname' => $fname));
    if (!$exists) {
        $func = new stdClass();
        $func->externalserviceid = $serviceid;
        $func->functionname = $fname;
        $DB->insert_record('external_services_functions', $func);
        echo "Funcion agregada: $fname\n";
    }
}

// Generar token para admin
$user = $DB->get_record('user', array('username' => 'admin'));
$existing_token = $DB->get_record('external_tokens', array('userid' => $user->id, 'externalserviceid' => $serviceid));

if ($existing_token) {
    echo "TOKEN: $existing_token->token\n";
} else {
    $token = md5(uniqid(rand(), true));
    $tokenobj = new stdClass();
    $tokenobj->token = $token;
    $tokenobj->userid = $user->id;
    $tokenobj->externalserviceid = $serviceid;
    $tokenobj->tokentype = 0;
    $tokenobj->contextid = 1;
    $tokenobj->creatorid = $user->id;
    $tokenobj->timecreated = time();
    $tokenobj->validuntil = 0;
    $DB->insert_record('external_tokens', $tokenobj);
    echo "TOKEN: $token\n";
}
