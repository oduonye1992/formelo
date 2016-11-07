<?php
namespace commands;
use GuzzleHttp\Client;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

class InitCommand extends Command
{
    protected $commandName = 'init';
    protected $commandDescription = "Initializes the Application";

    protected $commandArgumentName = "name";
    protected $commandArgumentDescription = "";

    protected $commandOptionName = "name"; // should be specified like "app:greet John --cap"
    protected $commandOptionDescription = '';

    protected function configure(){
        $this
            ->setName($this->commandName)
            ->setDescription($this->commandDescription)
            ->addArgument(
                $this->commandArgumentName,
                InputArgument::OPTIONAL,
                $this->commandArgumentDescription
            )
            ->addOption(
                $this->commandOptionName,
                null,
                InputOption::VALUE_NONE,
                $this->commandOptionDescription
            );
    }
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $io->title("Welcome to Formelo. Yayy!");
        $config = (array) Globals::getJSON();
        // A S K   F O R   U S E R   P A R A M S
        $io->text('Formelo helps you build applications rapidly.');
        $appName = $io->ask("Application name");
        $appDesc = $io->ask("Description", "");
        $appTeam = $io->ask("What is your Team's name. e.g demo ", "");
        $username = $io->ask("Enter your Username", "");
        $apikey = $io->ask("Enter your API Key", "");
        $appletMode = $io->choice('Make this applet Public ?', array('public', 'private'), 'public');
        // Bug - Ideally a new referncen code will be set from the server
        // But for now, we'll randomly generate on
        $tempUniqueRefPrefix = Globals::generateRandomString(8);
        $appReferenceCode = $tempUniqueRefPrefix."-8d72-11e6-8e46-bbec5ba9c49f";
        // U P D A T E   P A G E S   C O N F I G
        $config = (array) Globals::getJSON();
        $config['name'] = $appName;
        $config['description'] = $appDesc;
        $config['scope'] = $appletMode;
        $config['cred']->username = $username;
        $config['cred']->api_key = $apikey;
        $config['code'] = $appTeam;
        $config['reference_code'] = $appReferenceCode;

        $conf = [
            "icon_url" => "https://cdn.formelo.com/uploads/20151216/12/1450268948584-facebook-256x256.png",
            "user_group" => [],
            "description" => $appDesc,
            "status" => "live",
            "reference_code" => $appReferenceCode,
            "default_submission_status" => "accepted",
            "scope" => $appletMode,
            "name" => $appName,
            "parameters" => [
                "is_submittable" => true
            ],
            'mode' => 'dynamic',
            'root' => null,
            'pages' => [],
            'exports' => [
                'js' => []
            ],
            'imports' => [
                'js' => [],
                'css' => []
            ]
        ];

        // R E G I S T E R   T O   A P P  S T O R E
        $io->text('Creating...');
        $client = new Client();
        try {
            //"http://requestb.in/1kxrrsp1",[//
            $res = $client->request('POST',  "https://$appTeam.formelo.com/api/v1/applets", [
                'auth' => [$username, $apikey],
                'headers'  => [
                    'content-type' => 'application/json; charset=UTF-8',
                    'Accept' => 'application/json'
                ],
                'json' => $conf
            ]);
            if ($res->getStatusCode() == 201) {
                $responseHeader = $res->getHeaders();
                $config['id'] = isset($responseHeader['X-Entity-ID']) ? $responseHeader['X-Entity-ID'][0] : null;
                $io->success(array(
                    'All set. Go build something awesome',
                    'For a quickstart guide, see https://developer.formelo.com',
                ));
                Globals::saveJSON($config);
            }
        } catch (\Exception $e) {
            $io->error("Error connecting to server. Please check your internet connection and tru again. ".$e->getMessage());
        }
    }
}