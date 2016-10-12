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

        // A S K   F O R   U S E R   P A R A M S
        $io->text('Formelo helps you build applications rapidly.');
        $appName = $io->ask("Application name");
        $appDesc = $io->ask("Description", "");
        $appTeam = $io->ask("What is your Team's name. e.g demo ", "");
        $username = $io->ask("Enter your Username", "");
        $apikey = $io->ask("Enter your API Key", "");
        $appletMode = $io->choice('Make this applet Public ?', array('public', 'private'), 'private');

        // U P D A T E   P A G E S   C O N F I G
        $config = (array) Globals::getJSON();
        $config['name'] = $appName;
        $config['description'] = $appDesc;
        $config['scope'] = $appletMode;
        $config['cred']->username = $username;
        $config['cred']->api_key = $apikey;
        $config['code'] = $appTeam;

        // R E G I S T E R   T O   A P P  S T O R E
        $io->text('Creating...');
        $client = new Client();
        try {
            $res = $client->request('POST', "https://requestb.in/q9euc8q9", [ //"$appTeam.formelo.com/api/applets"
                'auth' => [$username, $apikey],
                'headers'  => [
                    'content-type' => 'application/json; charset=UTF-8',
                    'Accept' => 'application/json'
                ],
                'json' => $config
            ]);
            if ($res->getStatusCode() == 201) {
                $responseHeader = $res->getHeaders();
                $config['id'] = isset($responseHeader['X-Entity-ID']) ? $responseHeader['X-Entity-ID'] : null;
                $io->write($res->getStatusCode());
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