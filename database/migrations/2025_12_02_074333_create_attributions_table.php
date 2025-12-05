<!-- 

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attributions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
    $table->foreignId('zone_id')->constrained('zones_attribution')->onDelete('cascade');
    $table->integer('quantite');
    $table->date('date_attribution');
    $table->timestamps();
});

    }

    public function down(): void {
        Schema::dropIfExists('attributions');
    }
}; -->
