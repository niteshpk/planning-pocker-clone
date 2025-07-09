<?php

namespace Database\Seeders;

use App\Models\VotingSystem;
use Illuminate\Database\Seeder;

class VotingSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $votingSystems = [
            [
                'name' => 'Fibonacci',
                'values' => ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?']
            ],
            [
                'name' => 'Modified Fibonacci',
                'values' => ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?']
            ],
            [
                'name' => 'T-Shirt Sizes',
                'values' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?']
            ],
            [
                'name' => 'Powers of 2',
                'values' => ['1', '2', '4', '8', '16', '32', '64', '?']
            ],
            [
                'name' => 'Linear',
                'values' => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?']
            ]
        ];

        foreach ($votingSystems as $system) {
            VotingSystem::updateOrCreate(
                ['name' => $system['name']],
                ['values' => $system['values']]
            );
        }
    }
}